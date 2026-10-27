import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Church as ChurchIcon, Clock, RefreshCw } from "lucide-react";
import { useChurch } from "@/lib/ChurchContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ChurchGate() {
  const { church, membership, identity, reload, leaveChurch } = useChurch();
  const [checking, setChecking] = useState(false);

  const checkAgain = async () => {
    setChecking(true);
    await reload();
    setChecking(false);
  };

  if (identity?.church_id && church && membership && membership.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-heading">Waiting for approval</h1>
            <p className="text-sm text-muted-foreground">
              Your request to join {church.name} was sent to the church admin. Once they approve you,
              your church space will open.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={checkAgain} disabled={checking}>
                <RefreshCw className={checking ? "animate-spin" : ""} />
                Check again
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Back to the home page</Link>
              </Button>
            </div>
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={leaveChurch}
            >
              Leave {church.name}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ChurchIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-heading">You're not in a church space yet</h1>
          <p className="text-sm text-muted-foreground">
            Start a church space for your congregation, or join one that already exists with the
            code your church admin shares.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to="/register-church">Register your church</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/join">Join a church</Link>
            </Button>
          </div>
          <Link to="/" className="block text-xs text-muted-foreground underline">
            Back to the home page
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}