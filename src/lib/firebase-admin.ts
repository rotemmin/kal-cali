import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export async function cleanupUnverifiedUsers(threshold: number = 24) {
  try {
    // Get all users from authentication
    const listUsersResult = await admin.auth().listUsers();
    const unverifiedUsers = listUsersResult.users.filter(
      user => !user.emailVerified && 
      user.metadata.creationTime && 
      (new Date().getTime() - new Date(user.metadata.creationTime).getTime()) > threshold * 60 * 60 * 1000
    );

    // Delete unverified users
    for (const user of unverifiedUsers) {
      console.log(`Deleting unverified user: ${user.email}`);
      await admin.auth().deleteUser(user.uid);
      
      // Optionally delete the user's data from Firestore
      try {
        await admin.firestore().collection('user_metadata').doc(user.uid).delete();
        await admin.firestore().collection('user_activity').doc(user.uid).delete();
      } catch (err) {
        console.log(`No Firestore data to delete for user ${user.uid}`);
      }
    }

    console.log(`Cleaned up ${unverifiedUsers.length} unverified users`);
    return unverifiedUsers.length;
  } catch (error) {
    console.error('Error cleaning up unverified users:', error);
    throw error;
  }
}

export default admin;