# Aura Class

A responsive web classroom for separate Student and Teacher accounts, inspired by the supplied home-page reference.

## Run the app

1. Extract the project folder.
2. Start a local web server inside it:

   ```powershell
   py -m http.server 8000
   ```

3. Open `http://localhost:8000`.
4. Sign in with Google or Facebook. On first sign-in, select Student or Teacher. Firebase Authentication providers must be enabled, and `localhost` must be listed under Authentication → Settings → Authorized domains.

Camera and microphone access requires `localhost` or HTTPS. A direct `file://` open will not support sign-in or WebRTC correctly.

## Firebase setup

`firebase-config.js` contains the Firebase Web App config and the Realtime Database endpoint supplied for Aura Class (`https://aura-class-fb7a0-default-rtdb.firebaseio.com`).

Before using class sync, open Firebase Console → Realtime Database → Rules, replace the rules with the contents of `database.rules.json`, and click **Publish**. These rules let signed-in users read published class IDs, let a class owner publish and manage their class, let students join themselves, and let teachers read their own student list. Google and Facebook sign-in must also be enabled in Authentication.

The endpoint typically looks like `https://<database-name>.firebaseio.com` for `us-central1` or `https://<database-name>.<region>.firebasedatabase.app` for other regions. Follow Firebase’s [Realtime Database Web setup guide](https://firebase.google.com/docs/database/web/start) and configure authenticated security rules before enabling shared data. Do not use a database secret in browser code.

Google and Facebook sign-in use Firebase Authentication. Facebook additionally requires an app ID and secret configured in Firebase; never put the Facebook secret in this project.

## Features currently in this project

- Student and Teacher sign-in roles with separate `AC-…` and `TC-…` IDs.
- Profile details and searchable student IDs synced to Firebase; teacher Student lists sync across devices.
- Teacher-created classes are published to Firebase with shareable Class IDs. Teachers can add registered students by Student ID; listed or unlisted students can join with the class ID.
- Class routines, assignments, MCQ/descriptive exams, and grading.
- Student materials, bookmarks, submissions, exam results, announcements, and discussions.
- Browser class reminders while the app is open.
- WebRTC audio/video, peer chat, reactions, screen sharing, and a data-channel whiteboard.
- Local WebM recording download, resource playback speed controls, and resource downloads.

## Current storage and call limits

Published class metadata, student profiles, class memberships, and teacher rosters sync through Realtime Database after its rules are published. Routines, exams, assignments, resources, submissions, results, notices, and discussions are currently stored in this browser's `localStorage`; those records do not synchronize across accounts or devices yet. Do not put a Firebase database secret in browser code.

Live media uses WebRTC peer-to-peer. To connect, the teacher starts a live room and shares the generated offer; the student pastes it, returns an answer, and the teacher applies that answer. Both browsers must remain open during setup. A public STUN server is configured; some networks require a TURN relay. Push notifications while the app is closed, cloud recordings, and cloud file storage need additional Firebase services and deployment configuration.
