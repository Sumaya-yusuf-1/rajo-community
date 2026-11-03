import { NextResponse } from "next/server";
import { currentUser } from "@/lib/supabase/server";

type Context = {
  params: Promise<{ pollId: string }>;
};

// RÖSTA ELLER BYT RÖST
export async function POST(req: Request, { params }: Context) {
  try {
    const { pollId } = await params;
    const { supabase, user } = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Login required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const topicId = body?.topicId;

    if (typeof topicId !== "string") {
      return NextResponse.json(
        { error: "Invalid topic" },
        { status: 400 }
      );
    }

    const { error } = await supabase.rpc("rajo_talk_cast_vote", {
      p_poll_id: pollId,
      p_topic_id: topicId,
    });

    if (error) {
      console.error("RAJO Talk vote:", error);

      return NextResponse.json(
        { error: "Unable to vote or change vote" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RAJO Talk POST:", error);

    return NextResponse.json(
      { error: "Voting failed" },
      { status: 500 }
    );
  }
}

// ÅNGRA RÖST
export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { pollId } = await params;
    const { supabase, user } = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Login required" },
        { status: 401 }
      );
    }

    const { data: poll, error: pollError } = await supabase
      .from("rajo_talk_polls")
      .select("status")
      .eq("id", pollId)
      .single();

    if (pollError || !poll || poll.status !== "open") {
      return NextResponse.json(
        { error: "Poll is closed or unavailable" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("rajo_talk_votes")
      .delete()
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .select("topic_id");

    if (error) {
      console.error("RAJO Talk undo:", error);

      return NextResponse.json(
        { error: "Unable to undo vote" },
        { status: 400 }
      );
    }

    if (!data?.length) {
      return NextResponse.json(
        { error: "No vote was removed" },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RAJO Talk DELETE:", error);

    return NextResponse.json(
      { error: "Unable to undo vote" },
      { status: 500 }
    );
  }
}