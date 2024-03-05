# use cases:
    1. a new person is added (first contact is created)
    2. existing person adds a new contact
    3. two different existing persons are connected as one
    4. we find an existing contact

for every use case we need to return the entire data for the person

# how are we linking contacts ?
    we will use a parent-children structure to represent 1 person
    for a person in the database, there will be a primary contact(parent), and multiple secondary contacts(children) all referring to the same primary contact. the primary contact id is the linkedId for all secondary contacts

# building response:
    find the primary contact id.
    query all contacts with linkedId as primary contact id and build response.

# Steps:
## make sure atleast one of mobile and email is present

## if only one of mobile or email is present
    we first try to find a contact using mobile/email build and return response
    if we could not find any contact, we create a new one and build and return response

## if both mobile and email are present:

    query the database for given email, mobile --> existingContact
    if existingContact is present:
        4. we find an existing contact

    query the database for given email --> contact1
    query the database for given mobile --> contact2

    if only one of (contact1, contact2) exist:
        2. existing person adds a new contact

    if both contact1 and contact2 are null:
        1. a new person is added

    if both contact1 and contact2 are present:
        both belong to same contact group
            4. we find an existing contact
        both belong to different contact group
            3. two different existing persons are connected as one


# use cases in detail:
1. a new person is added
   we create a new account with given details and mark as primary

2. existing person adds a new contact
   we create a new account with given details and mark as secondary
   if the existing account is primary, use its id in linkedId
   else use the linkedId of the existing account here as well

3. two different existing persons are connected as one
    we need to select the group created first as parent group
    update the linkedId and linkPrecedence of the other group
