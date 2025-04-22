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

interface CleanupResult {
  unverifiedUsers: number;
  incompleteProfiles: number;
  errors: string[];
}

export async function cleanupInactiveUsers(thresholdHours: number = 48): Promise<CleanupResult> {
  const result: CleanupResult = {
    unverifiedUsers: 0,
    incompleteProfiles: 0,
    errors: []
  };

  try {
    // Get all users from authentication
    const listUsersResult = await admin.auth().listUsers();
    const now = new Date().getTime();
    const thresholdMs = thresholdHours * 60 * 60 * 1000;

    // Get Firestore instance
    const firestore = admin.firestore();
    
    for (const user of listUsersResult.users) {
      try {
        if (!user.metadata.creationTime) continue;
        
        const creationTime = new Date(user.metadata.creationTime).getTime();
        const timeSinceCreation = now - creationTime;

        // Skip if user was created less than threshold hours ago
        if (timeSinceCreation < thresholdMs) continue;

        // Get user metadata from Firestore
        const userMetadataDoc = await firestore
          .collection('user_metadata')
          .doc(user.uid)
          .get();

        const shouldDelete = await shouldDeleteUser(user, userMetadataDoc);
        
        if (shouldDelete) {
          // Delete user and their data
          await deleteUserAndData(user.uid);
          
          // Update counters
          if (!user.emailVerified) {
            result.unverifiedUsers++;
          }
          if (!userMetadataDoc.exists || !userMetadataDoc.data()?.profileComplete) {
            result.incompleteProfiles++;
          }
        }
      } catch (error) {
        const errorMessage = `Error processing user ${user.uid}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMessage);
        console.error(errorMessage);
      }
    }

    console.log(`Cleanup completed:
      - Unverified users deleted: ${result.unverifiedUsers}
      - Incomplete profiles deleted: ${result.incompleteProfiles}
      - Errors encountered: ${result.errors.length}`);

    return result;
  } catch (error) {
    const errorMessage = `Error in cleanup process: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMessage);
    console.error(errorMessage);
    return result;
  }
}

async function shouldDeleteUser(
  user: admin.auth.UserRecord, 
  userMetadataDoc: admin.firestore.DocumentSnapshot
): Promise<boolean> {
  // Case 1: Unverified email
  if (!user.emailVerified) {
    return true;
  }

  // Case 2: No metadata document or incomplete profile
  if (!userMetadataDoc.exists || !userMetadataDoc.data()?.profileComplete) {
    return true;
  }

  return false;
}

async function deleteUserAndData(userId: string): Promise<void> {
  const firestore = admin.firestore();
  
  try {
    // Delete user authentication
    await admin.auth().deleteUser(userId);
    
    // Delete user metadata
    await firestore.collection('user_metadata').doc(userId).delete();
    
    // Delete user activity
    await firestore.collection('user_activity').doc(userId).delete();
    
    console.log(`Successfully deleted user ${userId} and all associated data`);
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
}

export default admin;