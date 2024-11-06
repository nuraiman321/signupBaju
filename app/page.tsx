"use client";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { createDirectus, rest, readItems } from "@directus/sdk";
import { endpoint, collection } from "@/config/API";
import { Button } from "@nextui-org/button";
import { FamilyGroup } from "@/config/model";

export default function Home() {
  const client = createDirectus(endpoint.url).with(rest());
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup[]>([]);
  const [pageLoading, setPageLoading] = useState<Boolean>(false);

  const fetchFamilyGroup = async () => {
    try {
      const result = await client.request(
        readItems(collection.familyGroup, {
          filter: { status: { _eq: "published" } },
          fields: [
            "id",
            "FAMILY_NAME",
            // {
            //   states: ["state"],
            //   diningcategory: ["category"],
            // },
          ],
        })
      );
      console.log(result, "FG");
      setFamilyGroup(result as any as FamilyGroup[]);
      setPageLoading(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchFamilyGroup();
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        {/* <span className={title()}>Make&nbsp;</span>
        <span className={title({ color: "violet" })}>beautiful&nbsp;</span> */}
        <br />
        <span className={title()}>Pilih Nama Keluarga.</span>
      </div>
      {!pageLoading ? (
        <div></div>
      ) : (
        familyGroup.map((fam) => (
          <Button
          key={fam.id}
            href={`/family?id=${fam.id}`}
            as={Link}
            color="primary"
            showAnchorIcon
            variant="solid"
          >
            {fam.FAMILY_NAME}
          </Button>
          // <div key={fam.id}>{fam.familyName}</div>
        ))
      )}
    </section>
  );
}
