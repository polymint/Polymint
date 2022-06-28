import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { defaultImgs } from "../public/defaultImgs";
import PostInFeed from "../components/PostinFeed";
import moralis from "moralis";
import { useMoralis } from "react-moralis";

moralis.initialize(process.env.NEXT_PUBLIC_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;

const ProfileContent = () => {
  const [banner, setBanner] = useState();
  const [pfp, setPfp] = useState();
  // const { Moralis } = useMoralis();
  const user = moralis.User.current();

  useEffect(() => {
    if(!user) return null;
    setBanner(user.get("banner"));
    setPfp(user.get("pfp"))
  }, [user]);

  console.log(banner)
  console.log(pfp)

  return (
    <>
      <div className="mainContent">
          <img className="profileBanner" src={banner ? banner : defaultImgs[1]}></img>
          <div className="pfpContainer">
            <img className="profilePFP" src={pfp ? pfp : defaultImgs[0]}></img>
            <div className="profileName">{user?.attributes.username.slice(0, 15)}</div>
            <div className="profileWallet">{`${user?.attributes.ethAddress.slice(0, 4)}...
            ${user?.attributes.ethAddress.slice(38)}`}</div>
            <Link href="/settings">
                <a className="profileEdit">Edit Profile</a>
            </Link>
            <div className="profileBio">
            {user?.attributes.bio}
            </div>
            <div className="profileTabs">
                <div className="profileTab">
                    Your Posts 
                </div>
            </div>
          </div> 
      </div>
      {/* <PostInFeed profile={true}></PostInFeed> */}
    </>
  )
}

export default ProfileContent
