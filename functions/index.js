const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { auth } = require('firebase-admin');
admin.initializeApp();

// auth trigger (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate(user => {
  // for background triggers you must return a value/promise
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    upvotedOn: [],
  });
});

// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
  const doc = admin.firestore().collection('users').doc(user.uid);
  return doc.delete();
});

// http callable function (adding a request)
exports.addRequest = functions.https.onCall((data, content)=>{

    if(!content.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Only authenticated users can add requests'
        );
    }
    if(data.text.length > 30){
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Request must be no more than 30 characters long'
        );
    }
    return new Promise((resolve, reject)=>{
        admin.firestore().collection('requests').add({
            text: data.text,
            upvotes: 0,
        }).then(()=>{
            return resolve();
        }).catch((e)=>{
            return reject(e);
        });
    });
});

//upvote callable function
exports.upvote = functions.https.onCall(async(data,context)=>{
    //check auth
    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can add requests'
        );
    }
    //get refs for user doc and request doc
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const request = admin.firestore().collection('requests').doc(data.id);

    const doc =await  user.get()
        //check user hasn't already upvoted the request
        if(doc.data().upvotedOn.includes(data.id)){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'You can upvoted something once'
            );
        }

        //update user array
        await user.update({
            upvotedOn: [...doc.data().upvotedOn,data.id]
        })
        //updates votes on the request
        return request.update({
            upvotes: admin.firestore.FieldValue.increment(1)
        });

  });
