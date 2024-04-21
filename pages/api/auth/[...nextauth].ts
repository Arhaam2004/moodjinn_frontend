import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import {signInWithEmailAndPassword} from 'firebase/auth';
import SpotifyProvider from "next-auth/providers/spotify";
import {auth} from "@/firebase.config";
import {any} from "prop-types";


export const authOptions = {
    // Configure one or more authentication providers
    pages: {
        signIn: '/signin'
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {},
            async authorize(credentials): Promise<any> {
                return await signInWithEmailAndPassword(auth, (credentials as any).email || '', (credentials as any).password || '')
                    .then(userCredential => {
                        if (userCredential.user) {
                            return userCredential.user;
                        }
                        return null;
                    })
                    .catch(error => (console.log(error)))
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log(error);
                    });
            }
        }),
        SpotifyProvider({
            clientId: 'e2d12b171e824b4ba99f26afada7b99a',
            clientSecret: 'c50ccb5a9bd14d628bbde1ea9198a441'

        })
    ],

}
// @ts-ignore
export default NextAuth(authOptions)