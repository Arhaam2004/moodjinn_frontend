'use client'

import Image from "next/image";
import {signIn, useSession} from "next-auth/react";
import {redirect} from "next/navigation"
import {collection, getDocs, query, where} from "@firebase/firestore";
import {db} from "@/firebase.config";
import {LegacyRef, useEffect, useRef, useState} from "react";
import Webcam from "react-webcam"
import {Button} from "@/components/ui/button";
import axios from "axios";
import SpotifyProvider from "next-auth/providers/spotify";
import {Spotify} from "react-spotify-embed";
import {sendMessage, initializeChat} from "@/helpers/gemini";
import Chatbot from "@/components/Chatbot";


interface UserProfile{
  email: string;
  first_name: string;
  last_name: string;
  age: number;
  uid: string;
  spotify_connected: boolean;
  spotify_access: string;
  spotify_refresh: string;
}

interface Movie {
  link: string;
  image: string;
  description: string;
}


export default function Home() {

  const [spotifyId, setSpotifyId] = useState<string>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const webcamRef = useRef<any>();
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);


  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin')
    }
  })

  async function spotifyProfile(accessToken: string | undefined) {

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });

    const data = await response.json();
    console.log(data);
    console.log(data.id)
    setSpotifyId(data.id)
  }

  async function sendMovieRequest(mood: string) {
    try {
      const response = await axios.post<Movie[]>('http://localhost:8000/api/movies/', { mood });
      setMovies(response.data); // Update movies state with response data
      return response.data;
    } catch (error) {
      console.error('Error sending movie request:', error);
      throw error;
    }
  }


  async function getProfile() {
    const q = query(collection(db, "users"), where("email", "==", session.data?.user?.email));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      setProfile(doc.data() as UserProfile)

    });
  }

  async function getSpotifyData(accessToken: string | undefined, mood: string) {
    try {
      const day = getCurrentDayOfWeek()
      const response = await axios.post('http://localhost:8000/api/spotify-data/', {
        access_token: accessToken,
        user_id: spotifyId,
        name: profile?.first_name + "'s " + day + " Mood Playlist",
        mood: mood
      });
      console.log(response.data.url);
      setPlaylistUrl(response.data.url);

      return response.data;
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      throw error;
    }
  }


  async function getMood(){
    console.log("got here")
    if(webcamRef.current!==null) {
      let response = await axios.post(`http://localhost:8000/api/post-image/`, {
        image: webcamRef.current.getScreenshot(),
        token: localStorage.getItem("token"),
      });
      let songs = response.data.songs;
      let resMood = response.data.mood;
      console.log(resMood);
      getSpotifyData(profile?.spotify_access, resMood)
      sendMovieRequest(resMood);
    }
  }

  function getCurrentDayOfWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[dayOfWeek];
  }

  useEffect(()=>{
    if(session.data?.user?.email!=undefined){
      getProfile();
    }
  },[session])

  useEffect(() => {
    if(profile){
      console.log(profile)
      spotifyProfile(profile.spotify_access)
    }
  }, [profile]);

  console.log(session.data)



  return (
      <div>
        {playlistUrl!==null ? (
            // Second part: Render this if playlistUrl is not null
            <main className="w-full h-screen bg-zinc-200">
              <div className="w-full h-full flex flex-row">
                <div className={"w-2/3 items-center justify-center flex flex-col"}>
                  <p className={"text-6xl font-bold mb-16 text-center"}><span
                      className={"text-gray-900"}>Good evening</span>, <span
                      className={"text-green-700"}>{profile?.first_name}</span>. What's on your mind?</p>
                  <Spotify link={playlistUrl} className={"w-3/6 h-4/6"}/>
                </div>
                <div className={"w-1/3 items-center justify-center flex"}>
                  <p>No activities recommended for now. Your condition looks optimal :)</p>
                </div>
                <div className='flex flex-col gap-2 w-[23rem] h-96 overflow-y-auto snap-y'>
                  {/* Render chat history */}

                </div>
              </div>
            </main>
        ) : (
            // First part: Render this if playlistUrl is null
            <main className="w-full h-screen bg-neutral-300">
              <div className="w-full h-full flex flex-col">
                <div className={"w-3/3 items-center justify-center flex flex-col"}>
                  <Webcam ref={webcamRef} className={""}/>

                  <Button onClick={getMood}>Get Mood</Button>
                </div>

              </div>
            </main>
        )}
      </div>
  )
      ;
}

Home.requireAuth = true;