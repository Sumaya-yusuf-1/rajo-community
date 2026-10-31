import { NextResponse } from "next/server";
import { currentUser } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ❤️ RÖSTA
export async function POST(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const { supabase, user } = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Login required" },
        { status: 401 }
      );
    }

    // Kontrollera om användaren redan har röstat
    const { data: existingVote, error: checkError } =
      await supabase
        .from("idea_votes")
        .select("idea_id")
        .eq("idea_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (checkError) {
      console.error("Vote check error:", checkError);

      return NextResponse.json(
        { error: "Unable to check vote" },
        { status: 500 }
      );
    }

    if (existingVote) {
      return NextResponse.json(
        { error: "Already voted" },
        { status: 409 }
      );
    }

    // Spara rösten i Supabase
    const { data, error } = await supabase
      .from("idea_votes")
      .insert({
        idea_id: id,
        user_id: user.id,
      })
      .select("idea_id")
      .single();

    if (error) {
      console.error("Vote insert error:", error);

      return NextResponse.json(
        {
          error:
            error.code === "23505"
              ? "Already voted"
              : "Voting unavailable",
        },
        {
          status: error.code === "23505" ? 409 : 400,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      voted: true,
      ideaId: data.idea_id,
    });
  } catch (error) {
    console.error("Voting failed:", error);

    return NextResponse.json(
      { error: "Voting failed" },
      { status: 500 }
    );
  }
}

// ↩️ ÅNGRA RÖST
export async function DELETE(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const { supabase, user } = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Login required" },
        { status: 401 }
      );
    }

    // Ta bara bort den inloggade användarens röst
    const { data, error } = await supabase
      .from("idea_votes")
      .delete()
      .eq("idea_id", id)
      .eq("user_id", user.id)
      .select("idea_id");

    if (error) {
      console.error("Undo vote error:", error);

      return NextResponse.json(
        { error: "Unable to undo vote" },
        { status: 400 }
      );
    }

    // Kontrollera att en röst faktiskt togs bort
    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: "No vote was removed. Check database permissions.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      voted: false,
      ideaId: id,
    });
  } catch (error) {
    console.error("Unable to undo vote:", error);

    return NextResponse.json(
      { error: "Unable to undo vote" },
      { status: 500 }
    );
  }
}