var express = require('express');
var router = express.Router();

var request = require('request');
//auth parameters
var USER_LOGIN = 'arxitim@protonmail.com';
var USER_HASH = 'production secret';
//

/* GET contacts listing. */
router.get('/', function(req, res, next) {
    var context = {
        title: 'Пример тестового задания от Арсения Тимченко',
        contacts: []
    };

    var authOptions = {
        url: 'https://arxitim.amocrm.ru/private/api/auth.php',
        method: 'POST',
        qs: {
            USER_LOGIN: USER_LOGIN,
            USER_HASH: USER_HASH,
            type: 'json'
        }
    };

    request(authOptions, function(err, authHttpResponse, body) {
        var authResponse = JSON.parse(body);

        if (!authResponse['response']['auth']) {
            console.log('Auth fail');
        }

        var getContactsOptions = {
            url: 'https://arxitim.amocrm.ru/api/v2/contacts/',
            method: 'get',
            headers: {
                Cookie: authHttpResponse['headers']['set-cookie'][0]
            }
        };

        request(getContactsOptions, function(err, contactsHttpResponse, body) {
            var contacts = JSON.parse(body)['_embedded']['items'];
            
            contacts.forEach(function(contact) {
                var contactData = {
                    name: contact.name
                }
                
                contact['custom_fields'].forEach(function(field) {
                    switch (field.id) {
                        case 54601:
                            contactData.position = field.values[0].value;
                            break;
                        case 54603:
                            contactData.phone = field.values[0].value;
                            break;
                        case 54605:
                            contactData.email = field.values[0].value;
                            break;
                    }
                });
                
                context['contacts'].push(contactData);
                
                
            });
            
            res.render('users', context);
        });

    });
});

module.exports = router;
