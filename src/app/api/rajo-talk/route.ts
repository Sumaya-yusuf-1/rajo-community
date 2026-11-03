import { NextResponse } from "next/server";
import { currentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type VoteResult = {
  topic_id: string;
  vote_count: number;
};

export async function GET() {
  try {
    const { supabase, user } = await currentUser();

    // 1. Find the latest RAJO Talk poll
    const { data: poll, error: pollError } = await supabase
      .from("rajo_talk_polls")
      .select("id, title, status, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pollError) throw pollError;

    if (!poll) {
      return NextResponse.json({
        poll: null,
        topics: [],
        totalVotes: 0,
        myTopicId: null,
      });
    }

    // 2. Get discussion topics
    const { data: topics, error: topicsError } = await supabase
      .from("rajo_talk_topics")
      .select(
        "id, title_sv, title_so, description_sv, description_so"
      )
      .eq("poll_id", poll.id)
      .order("created_at", { ascending: true });

    if (topicsError) throw topicsError;

    // 3. Get aggregated voting results
    const { data: results, error: resultsError } =
      await supabase.rpc("rajo_talk_vote_results", {
        p_poll_id: poll.id,
      });

    if (resultsError) throw resultsError;

    const voteResults = (results ?? []) as VoteResult[];

    // 4. Calculate total votes
    const totalVotes = voteResults.reduce(
      (sum, result) => sum + Number(result.vote_count),
      0
    );

    // 5. Get the current user's selected topic
    let myTopicId: string | null = null;

    if (user) {
      const { data: myVote, error: myVoteError } = await supabase
        .from("rajo_talk_votes")
        .select("topic_id")
        .eq("poll_id", poll.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (myVoteError) throw myVoteError;

      myTopicId = myVote?.topic_id ?? null;
    }

    // 6. Combine topics with voting results
    const topicsWithVotes = (topics ?? []).map((topic) => {
      const result = voteResults.find(
        (vote) => vote.topic_id === topic.id
      );

      const votes = Number(result?.vote_count ?? 0);

      return {
        ...topic,
        votes,
        percentage:
          totalVotes > 0
            ? Math.round((votes / totalVotes) * 100)
            : 0,
      };
    });

    return NextResponse.json(
      {
        poll,
        topics: topicsWithVotes,
        totalVotes,
        myTopicId,
        isLoggedIn: Boolean(user),
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("RAJO Talk API error:", error);

    return NextResponse.json(
      { error: "Unable to load RAJO Talk" },
      { status: 500 }
    );
  }
}