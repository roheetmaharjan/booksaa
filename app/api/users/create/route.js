import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstname, lastname, email, role } = body;
    if (!firstname || !lastname || !email || !role) {
      return NextResponse.json(
        { error: "name, firstname, lastname, role, email are required" },
        { status: 400 }
      );
    }
    const newUser = {
      id: Date.now(),
      firstname,
      lastname,
      email,
      role,
    };

    return NextResponse.json({ User: newUser }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
