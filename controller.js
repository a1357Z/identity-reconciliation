const { Op, Sequelize } = require("sequelize")
const {Contact, sequelize} = require("./db")

module.exports = async function (req, res) {
    try{
        const { email, phoneNumber } = req.body;

        // if one of them is missing, we have handled the case of both missing in the middleware
        if (!email || !phoneNumber){
            if(email){
                return handleOnlyEmailInPayload(email, res)
            }else{
                return handleOnlyPhoneNumberInPayload(phoneNumber, res)
            }
        }

        // both email and phoneNumber are present here
        // check for existing contact
        const existingContact = await Contact.findOne({ where: {email: email, phoneNumber: phoneNumber} });
        if (existingContact){
            const linkedId = getLinkedId(existingContact)
            const response = await buildResponseForManyContacts(linkedId)
            return res.status(200).send(response);
        }

        // the contact1 and contact2 cannot intersect as that is already handled above
        // query the database for given email --> contact1
        const contact1 = await Contact.findOne({ where: {email: email} });
        
        // query the database for given mobile --> contact2
        const contact2 = await Contact.findOne({ where: {phoneNumber: phoneNumber} });

        if(!contact1 && !contact2){
            // 1. a new person is added
            return createNewContact({ email, phoneNumber }, res)
        }else if(contact1 && contact2){
            // 3. two different existing contact groups are connected as one here
            
            // select contact1 group as parent group
            const parentLinkedId = getLinkedId(contact1)

            // update the linkedId for contact2 group
            const contact2LinkedId = getLinkedId(contact2)
            
            await Contact.update({ linkPrecedence: "secondary", linkedId: parentLinkedId }, {
                where: {
                    [Op.or]: [{ linkedId: contact2LinkedId }, { id: contact2LinkedId }]
                }
            });

            const response = await buildResponseForManyContacts(parentLinkedId)
            res.status(200).send(response);
        }else{
            // 2. existing person adds a new contact
            let existingContact = contact2;
            if(contact1)existingContact = contact1;

            const linkedId = getLinkedId(existingContact)
            
            const newAccount = await addNewAccountForExistingUser(existingContact, { email, phoneNumber })
            console.log("created new account:", newAccount)

            const response = await buildResponseForManyContacts(linkedId)
            res.status(200).send(response);

        }
    }catch(error){
        console.error('Error creating contact:', error);

        // Send an error response
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function createNewContact(payload, res){
    const newContact = await Contact.create({
        email: payload.email, 
        phoneNumber: payload.phoneNumber,
        linkPrecedence: "primary"
    });
    return res.status(200).json(buildResponseForSingleContact(newContact));
}

async function handleOnlyEmailInPayload(email, res){
    // check for existing contact
    const existingContact = await Contact.findOne({ where: {email: email} });
    if (existingContact){
        const linkedId = getLinkedId(existingContact)
        const response = await buildResponseForManyContacts(linkedId)
        return res.status(200).send(response);
    }else{
        // create a new contact
        return createNewContact({ email, phoneNumber: null }, res)
    }
}

async function handleOnlyPhoneNumberInPayload(phoneNumber, res){
    // check for existing contact
    const existingContact = await Contact.findOne({ where: {phoneNumber: phoneNumber} });
    if (existingContact){
        const linkedId = getLinkedId(existingContact)
        const response = await buildResponseForManyContacts(linkedId)
        return res.status(200).send(response);
    }else{
        // create a new contact
        return createNewContact({ email: null, phoneNumber: phoneNumber }, res)
    }
}


function buildResponseForSingleContact(contact){
    return {
		"contact":{
			"primaryContactId": contact.id,
			"emails": [contact.email], // first element being email of primary contact 
			"phoneNumbers": [contact.phoneNumber], // first element being phoneNumber of primary contact
			"secondaryContactIds": [] // Array of all Contact IDs that are "secondary" to the primary contact
		}
	}
}

async function buildResponseForManyContacts(linkedId){
    let response = {
		"contact":{
			"primaryContactId": linkedId,
			"emails": [], // first element being email of primary contact 
			"phoneNumbers": [], // first element being phoneNumber of primary contact
			"secondaryContactIds": [] // Array of all Contact IDs that are "secondary" to the primary contact
		}
	}

    const existingEmails = new Set()
    const existingPhoneNumbers = new Set()

    // find the primary contact
    const primaryContact = await Contact.findOne({ where: {id: linkedId} });

    if(primaryContact.dataValues.email){
        response.contact.emails.push(primaryContact.dataValues.email)
        existingEmails.add(primaryContact.dataValues.email)
    }
    
    if(primaryContact.dataValues.phoneNumber){
        response.contact.phoneNumbers.push(primaryContact.dataValues.phoneNumber)
        existingPhoneNumbers.add(primaryContact.dataValues.phoneNumber)
    }

    const secondaryContacts = await Contact.findAll({ where: {linkedId: linkedId} });
    
    secondaryContacts.forEach(item => {
        if(item.dataValues.email && !existingEmails.has(item.dataValues.email)){
            response.contact.emails.push(item.dataValues.email)
            existingEmails.add(item.dataValues.email)
        }

        if(item.dataValues.phoneNumber && !existingPhoneNumbers.has(item.dataValues.phoneNumber)){
            response.contact.phoneNumbers.push(item.dataValues.phoneNumber)
            existingPhoneNumbers.add(item.dataValues.phoneNumber)
        }

        response.contact.secondaryContactIds.push(item.dataValues.id)
    })

    return response
}

function getLinkedId(contact){
    let linkedId = contact.dataValues.linkedId;
    if (contact.dataValues.linkedId == null){
        linkedId = contact.dataValues.id
    }
    return linkedId
}

// contact is object of type Contact model
async function addNewAccountForExistingUser(contact, reqData){
    const object = {
        email: reqData.email, 
        phoneNumber: reqData.phoneNumber,
        linkPrecedence: "secondary",
        linkedId: getLinkedId(contact)
    }
    
    return await Contact.create(object);
}