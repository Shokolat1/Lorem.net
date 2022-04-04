const Joi = require('joi');

function validarUser(user){
    const schema = Joi.object({
        nomUser: Joi.string()
            .required(),
    
        apUser:Joi.string()
        .required(),
        
        emailUser: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        
        passUser:Joi.string()
        .alphanum()
        .min(5)
        .required(),

        confPass:Joi.string().
        required().
        valid(Joi.ref('passUser')),
    
        celUser:Joi.number()
        .min(10)
        .required(), 
    
        ciudadUser:Joi.string()
        .required(),
    })
    .options({abortEarly: false}, {abortEarly: false}, {stripUnknown: true})
    return schema.validate(user)
}

module.exports = {validarUser}