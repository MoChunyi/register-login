const security = {
    saltLengthInBits: 128,
    derivedKeyLengthInBits: 256,
    numOfIterations: 100000,
    stringToByteArray: function(string) {
        return new TextEncoder().encode(string)
    }, 

    hexString: function(buffer) {
        const byteArray = new Uint8Array(buffer);
        const hexCodes = [...byteArray].map(value => {
            const hexCode = value.toString(16);
            const paddedHexCode = hexCode.padStart(2, '0');
            return paddedHexCode;
        });
        return hexCodes.join('');
    },

    createSalt: function(clientRandomValueBytes) {
        var saltString = 'mochunyi';
        var saltStringMaxLength = 200;
        var saltHashInputLength = saltStringMaxLength + clientRandomValueBytes.length;  // 216 bytes
        for (var i = saltString.length; i < saltStringMaxLength; i++) {
            saltString += 'P';
        }

        var saltStringBytes = security.stringToByteArray(saltString);

        // Concatenate the Client Random Value bytes to the end of the salt string bytes
        var saltInputBytesConcatenated = new Uint8Array(saltHashInputLength);
        saltInputBytesConcatenated.set(saltStringBytes);
        saltInputBytesConcatenated.set(clientRandomValueBytes, saltStringMaxLength);
        //console.log("saltInputBytesConcatenated", saltInputBytesConcatenated)
        return crypto.subtle.digest('SHA-256', saltInputBytesConcatenated).then(digestValue => {
            //console.log("hexString", security.hexString(digestValue));
            return (new Uint8Array(digestValue)).subarray(0,16);
        })
    },

    derivedKeysFromPassword: function(password, clientRandomValueBytes, masterKeyBytes) {
        // Trim the password and convert it from ASCII/UTF-8 to a byte array
        var passwordTrimmed = password.trim();
        var passwordBytes = security.stringToByteArray(passwordTrimmed);

        // The number of iterations for the PPF and desired length in bits of the derived key
        var iterations = security.numOfIterations;
        var derivedKeyLength = security.derivedKeyLengthInBits;
        var saltBytesPromise = security.createSalt(clientRandomValueBytes);
        return saltBytesPromise.then(saltBytes => {
            //console.log("saltBytes: ", saltBytes);
             // Run the PPF
            return security.deriveKey(saltBytes, passwordBytes, iterations, derivedKeyLength)
        }).then(derivedKeyBytes => {
            //console.log("derivedKeyBytes1: ",derivedKeyBytes)
            return security.encryptMasterKeyAndHashedAuthenticationKey(derivedKeyBytes, masterKeyBytes, clientRandomValueBytes)
        })
    },


    /**
     * A wrapper function used for deriving a key from a password
     * @param {Uint8Array} saltBytes The salt as a byte array
     * @param {String} passwordBytes The password as a byte array
     * @param {Number} iterations The cost factor / number of iterations of the PPF to perform
     * @param {Number} derivedKeyLength The length of the derived key to create
     * @param {Function} callback A function to call when the operation is complete
     */
    deriveKey: function(saltBytes, passwordBytes, iterations, derivedKeyLength) {
        // If Web Crypto method supported, use that as it's nearly as fast as native
        if (window.crypto && window.crypto.subtle) {
            var derivedKeyBytesPromise = security.deriveKeyWithWebCrypto(saltBytes, passwordBytes, iterations, derivedKeyLength);
            return derivedKeyBytesPromise.then((derivedKeyBytes) => {
                return derivedKeyBytes;
            })
        } else (
            alert("no support web crypto")
        )
    },


    encryptMasterKeyAndHashedAuthenticationKey: function(derivedKeyBytes, masterKeyBytes, clientRandomValueBytes) {
        // Get the first 16 bytes as the Encryption Key and the next 16 bytes as the Authentication Key
        var derivedEncryptionKeyBytes = derivedKeyBytes.subarray(0, 16);
        var derivedAuthenticationKeyBytes = derivedKeyBytes.subarray(16, 32);

        var getCryptoKeyOfMasterKey = window.crypto.subtle.importKey(
            "raw",
            derivedEncryptionKeyBytes,
            "AES-CBC",
            true,
            ["encrypt"]
        );

        var hashedAuthenticationKey = crypto.subtle.digest('SHA-256', derivedAuthenticationKeyBytes)
            .then(hashedAuthenticationKey => {
                return new Uint8Array(hashedAuthenticationKey);
            })
        var encryptMasterKey = getCryptoKeyOfMasterKey.then((cryptoKey) => {
            //console.log(cryptoKey)
            let iv = derivedEncryptionKeyBytes;
            return window.crypto.subtle.encrypt(
                {
                    name: "AES-CBC",
                    iv
                },
                cryptoKey,
                masterKeyBytes
            )
        }).then(encryptedMasterKey => {
            return new Uint8Array(encryptedMasterKey);
        })
        return Promise.all([hashedAuthenticationKey, encryptMasterKey])
            
    },

    /**
     * Derive the key using the Web Crypto API
     * @param {Uint8Array} saltBytes The salt as a byte array
     * @param {Uint8Array} passwordBytes The password as a byte array
     * @param {Number} iterations The cost factor / number of iterations of the PPF to perform
     * @param {Number} derivedKeyLength The length of the derived key to create
     * @param {Function} callback A function to call when the operation is complete
     */
    deriveKeyWithWebCrypto: function(saltBytes, passwordBytes, iterations, derivedKeyLength) {

        'use strict';

        // Import the password as the key
        return crypto.subtle.importKey(
            'raw', passwordBytes, 'PBKDF2', false, ['deriveBits']
        )
        .then(function(key) {

            // Required PBKDF2 parameters
            var params = {
                name: 'PBKDF2',
                hash: 'SHA-512',
                salt: saltBytes,
                iterations: iterations
            };

            // Derive bits using the algorithm
            return crypto.subtle.deriveBits(params, key, derivedKeyLength);
        })
        .then(function(derivedKeyArrayBuffer) {

            // Convert to a byte array
            var derivedKeyBytes = new Uint8Array(derivedKeyArrayBuffer);

            // return derivedKeyBytesPromise;
            return derivedKeyBytes;
        });
    },

    register: {
        startRegister: function(email, password,username) {
            // Create the 128 bit (16 byte) Client Random Value and Salt and Master Key
            var saltLengthInBytes = security.saltLengthInBits / 8;
            var clientRandomValueBytes = crypto.getRandomValues(new Uint8Array(saltLengthInBytes));
            var masterKeyBytes = crypto.getRandomValues(new Uint8Array(saltLengthInBytes));
            var clientToServerDataPromise = security.derivedKeysFromPassword(password, clientRandomValueBytes, masterKeyBytes)
            var serverToClientDataPromise = clientToServerDataPromise.then(clientToServerData => {
               return security.register.sendRegisterInfo(clientToServerData, clientRandomValueBytes, email, username)
            })
            serverToClientDataPromise.then(serverToClientData => {
                //console.log(serverToClientData);
                alert("老表，去验证你的邮箱吧")
            })   
        },
        sendRegisterInfo: function(clientToServerData, clientRandomValueBytes, email, username) {
            //console.log("clientToServerData", clientToServerData[1]);
            var clientToServerData = {
                email: email,
                username: username,
                clientRandomValue: clientRandomValueBytes,
                encryptMasterKey: clientToServerData[1],
                hashedAuthenticationKey: clientToServerData[0],
            }
            //console.log(clientToServerData)
            //console.log("zhuan", JSON.parse(JSON.stringify({})));
            return fetch("http://127.0.0.1:3001/register", {
                method: 'POST', 
                body: JSON.stringify(clientToServerData),
                mode: 'cors', // no-cors, cors, *same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json',
                    'X-Content-Type-Options': 'nosniff '
                },
                redirect: 'follow', // manual, *follow, error
            }).then((response) => {
                    return response.json()
            })
        },
    },

    login: {
        startLogin: function(email,password) {
            var serverToClientDataPromise = this.sendLoginInfo(email)
            var clientToServerDataPromise = serverToClientDataPromise
                .then(clientToServerData => {
                    if (clientToServerData.code === -1) {
                        alert("登录失败");
                    } else {
                        this.handleFeedbackFromServer(clientToServerData, password)
                    }    
                })
        },
        sendLoginInfo: function(email) {
            //console.log(email);
            return fetch('http://127.0.0.1:3001/login', {
                method: 'POST',
                body: JSON.stringify({email: email}),
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Content-Type-Options': 'nosniff '
                },
            }).then(response => {
                return response.json();
            })
        },
        handleFeedbackFromServer: function(serverToClientData, password) {
            //console.log(serverToClientData)
            var saltBytes = new Uint8Array(Object.values(serverToClientData.salt));
            var passwordTrimmed = password.trim();
            var passwordBytes = security.stringToByteArray(passwordTrimmed);
            var iterations = security.numOfIterations;
            var derivedKeyLength = security.derivedKeyLengthInBits;
            security.deriveKey(saltBytes,passwordBytes, iterations, derivedKeyLength)
                .then(derivedKeyBytes => {
                    //console.log("derivedKeyBytes2:", derivedKeyBytes);
                    var derivedEncryptionKeyBytes = derivedKeyBytes.subarray(0, 16);
                    var derivedAuthenticationKeyBytes = derivedKeyBytes.subarray(16, 32);
                    return this.sendAuthenticationKeyToServer(derivedAuthenticationKeyBytes);
                })
        },
        sendAuthenticationKeyToServer: function(derivedAuthenticationKeyBytes) {
            return fetch('http://127.0.0.1:3001/authentication', {
                method: 'POST',
                body: JSON.stringify({derivedAuthenticationKeyBytes: derivedAuthenticationKeyBytes}),
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Content-Type-Options': 'nosniff '
                },
            }).then(response => {
                return response.json();
            }).then(data => {
                //console.log("authentication: ", data)
                if (data.code === 200) {
                    alert('登录成功')
                } else {
                    alert('登录失败');
                }
            })
        }
    }
    
}

export default security;