import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnhrasuxqsiwksjtlltx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuaHJhc3V4cXNpd2tzanRsbHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NTU3ODMsImV4cCI6MjAzODUzMTc4M30.vHGpUdYPz-KBmpRmcwfL7_kaGsK0d0ieWlt0j29sxXs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// import { AppState } from 'react-native'
// import 'react-native-url-polyfill/auto'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = "https://fnhrasuxqsiwksjtlltx.supabase.co"
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuaHJhc3V4cXNpd2tzanRsbHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NTU3ODMsImV4cCI6MjAzODUzMTc4M30.vHGpUdYPz-KBmpRmcwfL7_kaGsK0d0ieWlt0j29sxXs'

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//     auth: {
//         storage: AsyncStorage,
//         autoRefreshToken: true,
//         persistSession: true,
//         detectSessionInUrl: false,
//     },
// })

// // Tells Supabase Auth to continuously refresh the session automatically
// // if the app is in the foreground. When this is added, you will continue
// // to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// // `SIGNED_OUT` event if the user's session is terminated. This should
// // only be registered once.
// AppState.addEventListener('change', (state) => {
//     if (state === 'active') {
//         supabase.auth.startAutoRefresh()
//     } else {
//         supabase.auth.stopAutoRefresh()
//     }
// })