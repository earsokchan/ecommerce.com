"use client";

import Link from "next/link";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          {/* Logo & Description */}
          <div>
            <h3 className="text-2xl font-bold text-white">YourCompany</h3>
            <p className="mt-4 text-gray-400 max-w-xs">
              We deliver awesome products to help your business grow faster.
            </p>
            <div className="mt-4 flex gap-4">
              <Link href="#" className="hover:text-white">
                <FaTwitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white">
                <FaLinkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white">
                <FaGithub className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Product</h4>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">Features</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">Pricing</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">Integrations</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Company</h4>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">About Us</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">Careers</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Legal</h4>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Buildware. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
