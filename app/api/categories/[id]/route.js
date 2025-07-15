import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";

export async function DELETE(req, context) {
  const { id } = context.params;

  if (!id) {
    return new NextResponse(JSON.stringify({ error: "category ID missing" }));
  }

  try {
    const deletedUser = await prisma.category.delete({
      where: { id: id },
    });

    return new NextResponse(JSON.stringify(deletedUser), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Category not found" }), {
      status: 404,
    });
  }
}

// export async function PATCH(req, context) {
//   const { id } = await context.params;

//   if (!id) {
//     return NextResponse.json({ error: "Category ID missing" }, { status: 400 });
//   }

//   try {
//     const body = await req.json();
//     const { name,image } = body;

//     if (!name) {
//       return NextResponse.json({ error: "Name is required" }, { status: 400 });
//     }

//     const updatedCategory = await prisma.category.update({
//       where: { id }, // UUID string
//       data: { 
//         name,
//         ...(image && { image }),
//        },
//     });

//     return NextResponse.json(updatedCategory, { status: 200 });
//   } catch (error) {
//     console.error("Update error:", error);
//     return NextResponse.json(
//       { error: error.message || "Category not found" },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(req, context) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: "Category ID missing" }, { status: 400 });
  }

  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const image = formData.get("image"); // this is a File object

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let imageFileName;

    // Handle file upload if a new image is provided
    if (image && typeof image === "object" && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const ext = image.name.split(".").pop();
      imageFileName = `${uuid()}.${ext}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", imageFileName);

      await fs.promises.writeFile(uploadPath, buffer);
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        ...(imageFileName && { image: imageFileName }), // only update image if provided
      },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: error.message || "Category update failed" },
      { status: 500 }
    );
  }
}