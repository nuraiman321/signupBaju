"use client";
import { Link } from "@nextui-org/link";
import { useEffect, useState } from "react";
import { createDirectus, rest, readItems } from "@directus/sdk";
import { Button } from "@nextui-org/button";
import { Accordion, AccordionItem } from "@nextui-org/accordion";

import { title } from "@/components/primitives";
import { endpoint, collection } from "@/config/API";
import { FamilyGroup } from "@/config/model";
import { Spinner } from "@nextui-org/spinner";

export default function Home() {
  const client = createDirectus(endpoint.url).with(rest());
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup[]>([]);
  const [kesangGroup, setKesangGroup] = useState<FamilyGroup[]>([]);
  const [kemendorGroup, setKemendorGroup] = useState<FamilyGroup[]>([]);
  const [pageLoading, setPageLoading] = useState<Boolean>(false);
  const [errorLoad, setErrorLoad] = useState<Boolean>(false);

  const fetchFamilyGroup = async () => {
    try {
      setPageLoading(true);
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

      if (result) {
        setFamilyGroup(result as any as FamilyGroup[]);
        const familyGroups: FamilyGroup[] = result.map((item: any) => ({
          id: item.id, // Map "identifier" to "id"
          FAMILY_NAME: item.FAMILY_NAME, // Map "familyName" to "FAMILY_NAME"
          // Map other properties if needed
        }));

        console.log(familyGroups, "FG");
        const kes = familyGroups.filter((kesg) =>
          kesg.FAMILY_NAME.includes("Kesang")
        );
        const kem = familyGroups.filter((kemn) =>
          kemn.FAMILY_NAME.includes("Kemendor")
        );
        setKesangGroup(kes);
        setKemendorGroup(kem);
        setPageLoading(false);
      }
      // setKesangGroup(result.filter(kes => kes))
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorLoad(true);
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
      {/* {!pageLoading ? (
        <div />
      ) : (
        familyGroup.map((fam) => (
          <Button
            key={fam.id}
            showAnchorIcon
            as={Link}
            color="primary"
            href={`/family?id=${fam.id}`}
            size="sm"
            variant="solid"
          >
            {fam.FAMILY_NAME}
          </Button>
          // <div key={fam.id}>{fam.familyName}</div>
        ))
      )} */}
      {pageLoading ? (
        <Spinner label="Loading..." color="warning" />
      ) : (
        <div className="acord">
          <Accordion fullWidth={true}>
            <AccordionItem
              key="1"
              aria-label="Accordion 1"
              subtitle="tekan sini"
              title="Kesang Side"
            >
              <div className="grid gap-1">
                {kesangGroup.map((kesg) => (
                  <Button
                    key={kesg.id}
                    showAnchorIcon
                    as={Link}
                    color="primary"
                    href={`/family?id=${kesg.id}`}
                    size="sm"
                    variant="solid"
                  >
                    {kesg.FAMILY_NAME}
                  </Button>
                ))}
              </div>
            </AccordionItem>
            <AccordionItem
              key="2"
              aria-label="Accordion 2"
              subtitle={<span>tekan sini</span>}
              title="Kemendor side"
            >
              <div className="grid gap-1">
                {kemendorGroup.map((kmn) => (
                  <Button
                    key={kmn.id}
                    showAnchorIcon
                    as={Link}
                    color="primary"
                    href={`/family?id=${kmn.id}`}
                    size="sm"
                    variant="solid"
                  >
                    {kmn.FAMILY_NAME}
                  </Button>
                ))}
              </div>
            </AccordionItem>
          </Accordion>

          {errorLoad? (
            <div>Error load data, try refresh </div>
          ):(<div></div>)}
        </div>
      )}
    </section>
  );
}
