"use client";

import React from "react";
import Image from "next/image";
import LogoutButton from "../LogoutButtom/LogoutButton";
import Aurora from "../Aurora/Aurora";

interface ProfilePageProps {
  name?: string;
  email?: string;
  profileImage?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  name = "Sun Dog",
  email = "mail@gmail.com",
  profileImage = "/assets/profile_picture.jpg",
}) => {
  return (
    <div
      className="flex justify-center items-center min-h-full w-full py-8"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div
        className="w-full max-w-4xl rounded-2xl shadow-sm overflow-hidden glassmorphism"
        style={{
          background: "var(--card)",
          color: "var(--card-foreground)",
        }}
      >
        <div className="relative h-60 overflow-hidden">
          <Aurora
            colorStops={["#0612bc", "#0f30d7", "#3e2a8d"]}
            amplitude={0.9}
            speed={0.9}
            blend={0.28}
          />
        </div>

        <div className="relative px-8 pb-8">
          <div className="absolute -top-20 left-8">
            <div
              className="w-40 h-40 rounded-full border-6 overflow-hidden shadow-lg"
              style={{ borderColor: "var(--profile-bg)" }}
            >
              <Image
                src={profileImage}
                alt={name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end"></div>

          <div className="mt-16">
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              {name}
            </h1>
            <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
              {email}
            </p>
          </div>
          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
