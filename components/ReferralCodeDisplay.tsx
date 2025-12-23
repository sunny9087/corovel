"use client";

import { useState } from "react";

export default function ReferralCodeDisplay({
  referralCode,
}: {
  referralCode: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <code className="bg-[#1F2937] border border-[#374151] px-4 py-2 rounded-lg text-lg font-mono font-bold text-[#E5E7EB]">
        {referralCode}
      </code>
      <button
        onClick={handleCopyLink}
        className="btn-primary text-sm px-4 py-2"
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}

