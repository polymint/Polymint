import React from 'react';
import Link from "next/link";
import { defaultImgs } from "../public/defaultImgs";
import PostInFeed from "../components/PostinFeed";
import { useMoralis } from "react-moralis"; 

const ProfileContent = () => {
  const { Moralis} = useMoralis();
  const user = Moralis.User.current();

  return (
    <>
      <div className="mainContent">
          <img className="profileBanner" src={user?.attributes.banner ? user.attributes.banner : defaultImgs[1]}></img>
          <div className="pfpContainer">
            <img className="profilePFP" src={user?.attributes.pfp ? user.attributes.pfp : defaultImgs[0]}></img>
            <div className="profileName">{user?.attributes.username.slice(0, 6)}</div>
            <div className="profileWallet">{`${user?.attributes.ethAddress.slice(0, 4)}...
            ${user?.attributes.ethAddress.slice(38)}`}</div>
            <Link href="/settings">
                <a className="profileEdit">Edit Profile</a>
            </Link>
            <div className="profileBio">
            Bio Placeholder
            </div>
            <div className="profileTabs">
                <div className="profileTab">
                    Your Posts 
                </div>
            </div>
          </div> 
      </div>
      <PostInFeed profile={true}></PostInFeed>
    </>
  )
}

export default ProfileContent
