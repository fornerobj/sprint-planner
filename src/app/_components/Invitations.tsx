"use client";

import { useState, useEffect } from "react";
import { getMyInvitations } from "~/server/queries";
import { acceptInvitation, declineInvitation } from "~/server/mutations";
import { LoadingSpinner } from "../_utils/Icons";
import type { ProjectInvitationType } from "~/server/db/schema";

export function MyInvitations({ invites }: { invites: any[] }) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  if (invites.length === 0) {
    return null; // Don't show anything if no invitations
  }

  const handleAccept = async (id: number) => {
    setProcessingId(id);
    try {
      await acceptInvitation({ invitationId: id });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      alert(
        error instanceof Error ? error.message : "Failed to accept invitation",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id: number) => {
    setProcessingId(id);
    try {
      await declineInvitation({ invitationId: id });
    } catch (error) {
      console.error("Error declining invitation:", error);
      alert(
        error instanceof Error ? error.message : "Failed to decline invitation",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-lg rounded-lg bg-slate-800 p-4">
      <h2 className="mb-4 text-xl font-semibold">Project Invitations</h2>
      <ul className="space-y-3">
        {invites.map((invitation) => (
          <li
            key={invitation.id}
            className="rounded-md border border-slate-700 p-3"
          >
            <p className="font-medium">
              You're invited to join:{" "}
              <span className="text-blue-400">{invitation.project.name}</span>
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleAccept(invitation.id)}
                disabled={processingId === invitation.id}
                className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
              >
                {processingId === invitation.id ? "Processing..." : "Accept"}
              </button>
              <button
                onClick={() => handleDecline(invitation.id)}
                disabled={processingId === invitation.id}
                className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
              >
                {processingId === invitation.id ? "Processing..." : "Decline"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
