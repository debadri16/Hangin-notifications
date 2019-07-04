'use strict'

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//notification for friend request
exports.sendNotification = functions.database.ref('/notifications/{user_id}/{notification_id}').onWrite((data, context)  => {
   /* * You can store values as variables from the 'database.ref'
   * Just like here, I've done for 'user_id' and 'notification'
   */
   const user_id = context.params.user_id;
   const notification_id = context.params.notification_id;
   console.log('We have a notification to send to : ', user_id);

   /*if(!context.data.val()){

     return console.log('A new notification has been deleted from the database : ', notification_id);

   }*/

   const fromUser = admin.database().ref(`/notifications/${user_id}/${notification_id}`).once('value');

   return fromUser.then(fromUserResult => {

     const from_user_id = fromUserResult.val().from;

     console.log('You have new notifcation from : ', from_user_id);

     const userQuery = admin.database().ref(`users/${from_user_id}/name`).once('value');

     return userQuery.then(userResult => {

       const userName = userResult.val();

       const deviceToken = admin.database().ref(`/users/${user_id}/device_token`).once('value');

       return deviceToken.then(result => {

         const token_id = result.val();

         const payload = {
           notification: {
             title : "Friend request",
             body : `${userName} has sent you request`,
             icon : "default",
             sound : "default",
             click_action : "com.example.asus.hangin_TARGET_NOTIFICATION"
           },
           data : {
             from_user_id : from_user_id
           }
         };

         return admin.messaging().sendToDevice(token_id, payload).then(response => {

           return console.log('This was the notification feature');


         });


       });

     });



   });


 });


//notification for chats
exports.sendNotificationChat = functions.database.ref('/messages/{user_id}/{chat_user_id}/{message_id}').onWrite((data, context)  => {
   /* * You can store values as variables from the 'database.ref'
   * Just like here, I've done for 'user_id' and 'notification'
   */
   const user_id = context.params.user_id;
   const chat_user_id = context.params.chat_user_id;
   const message_id = context.params.message_id;
   console.log('We have a notification to send to : ', user_id);

   /*if(!context.data.val()){

     return console.log('A new notification has been deleted from the database : ', notification_id);

   }*/

   const fromUser = admin.database().ref(`/messages/${user_id}/${chat_user_id}/${message_id}`).once('value');

   return fromUser.then(fromUserResult => {

     const from_user_id = fromUserResult.val().from;

     const message_txt = fromUserResult.val().message;

     console.log('You have new notifcation from : ', from_user_id);

     const userQuery = admin.database().ref(`users/${from_user_id}/name`).once('value');

     return userQuery.then(userResult => {

       const userName = userResult.val();

       const deviceToken = admin.database().ref(`/users/${user_id}`).once('value');

       return deviceToken.then(result => {

         const token_id = result.val().device_token;

         const is_online = result.val().online;

         const payload = {
           notification: {
             title : `New Message from ${userName}`,
             body : message_txt,
             sound : "default",
             tag : from_user_id,
             click_action : "com.example.asus.hangin_TARGET_NOTIFICATION"
           },
           data : {
             from_user_id : from_user_id
           }
         };

         if(from_user_id !== user_id && is_online !== "true"){

	         return admin.messaging().sendToDevice(token_id, payload).then(response => {

	           return console.log('This was the message notification feature.. sent');


	         });
	     }else{

	     	return console.log('This was the message notification feature.. witheld');

	     }


       });

     });



   });


 });

