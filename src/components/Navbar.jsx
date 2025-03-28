import Image from 'next/image';
import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[83vw] mx-auto px-4 sm:px-8 lg:px-10 py-6">
        <div className="rounded-4xl border border-slate-50 p-5 bg-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-10">
              <Image src="/svg/svgexport-1.svg" className='cursor-pointer' width={120} height={48} alt="Logo" />
              
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="#" className="text-gray-700 hover:text-gray-900 transition cursor-pointer">Product</Link>
                <Link href="#" className="text-gray-700 hover:text-gray-900 transition cursor-pointer">Use Case</Link>
                <Link href="#" className="text-gray-700 hover:text-gray-900 transition cursor-pointer">AI</Link>
                <Link href="#" className="text-gray-700 hover:text-gray-900 transition cursor-pointer">Resources</Link>
                <Link href="#" className="text-gray-700 hover:text-gray-900 transition cursor-pointer">Pricing</Link>
              </nav>
            </div>

            <div className="flex items-center space-x-6">
              <button className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg transition cursor-pointer">
                Request a demo
              </button>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in">
                  <button className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-4xl transition cursor-pointer">
                    Login
                  </button>
                </Link>
                <Link href="/sign-up">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-4xl hover:bg-blue-600 transition cursor-pointer">
                    Sign up
                  </button>
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;