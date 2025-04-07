import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore";

export const incrementPlayCount = async (songId) => {
  try {
    const songRef = doc(db, "songInteractions", songId.toString());
    const songDoc = await getDoc(songRef);

    if (songDoc.exists()) {
      await updateDoc(songRef, {
        plays: songDoc.data().plays + 1,
      });
    } else {
      await setDoc(songRef, {
        plays: 1,
        likes: [],
        shares: 0,
      });
    }
  } catch (error) {
    console.error("Failed to increment play count:", error);
    throw error;
  }
};

export const toggleLike = async (songId, userAddress) => {
  try {
    const songRef = doc(db, "songInteractions", songId.toString());
    const songDoc = await getDoc(songRef);

    if (!songDoc.exists()) {
      await setDoc(songRef, {
        plays: 0,
        likes: [userAddress],
        shares: 0,
      });
      return true;
    }

    const likes = songDoc.data().likes || [];
    if (likes.includes(userAddress)) {
      await updateDoc(songRef, {
        likes: arrayRemove(userAddress),
      });
      return false;
    } else {
      await updateDoc(songRef, {
        likes: arrayUnion(userAddress),
      });
      return true;
    }
  } catch (error) {
    console.error("Failed to toggle like:", error);
    throw error;
  }
};

export const incrementShareCount = async (songId) => {
  try {
    const songRef = doc(db, "songInteractions", songId.toString());
    const songDoc = await getDoc(songRef);

    if (songDoc.exists()) {
      await updateDoc(songRef, {
        shares: songDoc.data().shares + 1,
      });
    } else {
      await setDoc(songRef, {
        plays: 0,
        likes: [],
        shares: 1,
      });
    }
  } catch (error) {
    console.error("Failed to increment share count:", error);
    throw error;
  }
};

export const getSongInteractions = async (songId) => {
  // If songId is provided, fetch interactions for a single song
  if (songId) {
    try {
      const songRef = doc(db, "songInteractions", songId.toString());
      const songDoc = await getDoc(songRef);

      if (songDoc.exists()) {
        return songDoc.data();
      }
      return { plays: 0, likes: [], shares: 0 };
    } catch (error) {
      console.error("Failed to get song interactions:", error);
      throw error;
    }
  } else {
    // If no songId is provided, fetch interactions for all songs
    try {
      const interactions = {};
      const querySnapshot = await getDocs(collection(db, "songInteractions"));
      querySnapshot.forEach((doc) => {
        interactions[doc.id] = doc.data();
      });
      return interactions;
    } catch (error) {
      console.error("Failed to get all song interactions:", error);
      throw error;
    }
  }
};
