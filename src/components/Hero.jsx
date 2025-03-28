"use client"
import { Button } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import HeroSlider from "./HeroSlider";
import { useAuth } from "@clerk/nextjs";

const Hero = () => {
  const { isSignedIn } = useAuth();

  return (
    <div>
      <div className="flex flex-col items-center justify-center text-center py-20">
        <h1 className="baseNeueBlack text-6xl mb-4 font-black tracking-tighter">
          CREATE PRO LEVEL
          <br />
          VIDEOS IN THE BLINK OF AI
        </h1>
        <p className="text-xl mb-8">
          Make better videos faster. AI-powered video creation for teams
        </p>

        <Link href={isSignedIn ? "/editor" : "/editor"}>
          <Button size="xl" radius="xl" className="mb-6 flex items-center gap-6">
            {isSignedIn ? "Editor" : "Start for free"}
            <Image
              src="/svg/svgexport-8.svg"
              alt="Arrow"
              width={24}
              height={24}
            />
          </Button>
        </Link>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>*No credit card required</span>
          <div className="flex items-center gap-1">
            <Image
              src="/svg/svgexport-9.svg"
              alt="Rating"
              width={20}
              height={20}
            />
            <span>Rated 4.6 out of 5 on G2</span>
          </div>
        </div>
      </div>
      <div>
        <HeroSlider />
      </div>
    </div>
  );
};

export default Hero;
