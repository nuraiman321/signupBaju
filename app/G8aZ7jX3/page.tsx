"use client";
import { title } from "@/components/primitives";
import { collection, endpoint } from "@/config/API";
import { TotalUserBatikSize, UserBatikDetails } from "@/config/model";
import { createDirectus, readItems, rest } from "@directus/sdk";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { user } from "@nextui-org/theme";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const client = createDirectus(endpoint.url).with(rest());

  const [totalUserSizeRegFit, setTotalUserSizeRegFit] = useState<
    TotalUserBatikSize[]
  >([]);
  const [totalUserSizeSlimFit, setTotalUserSizeSlimFit] = useState<
    TotalUserBatikSize[]
  >([]);
  const [userBatik, setUserBatik] = useState<UserBatikDetails[]>([]);
  const [userBatikRegularFit, setUserBatikRegularFit] = useState<
    UserBatikDetails[]
  >([]);
  const [userBatikSlimFit, setUserBatikSlimFit] = useState<UserBatikDetails[]>(
    []
  );
  const [totalRegfit, setTotalRegFit] = useState<Number>(0);
  const [totaSlimFit, setTotalSlimFit] = useState<Number>(0);

  const fetchUserBatik = async () => {
    try {
      const result = await client.request(
        readItems(collection.userBatikDetails, {
          // filter: {
          //   // status: { _eq: "published" },
          //   FAMILY_NAME: { _eq: `${id}` },
          // },
          fields: [
            "id",
            "FAMILY_NAME",
            "NAME",
            "SHIRT_SIZE.SIZE",
            {
              SHIRT_SIZE: ["SIZE", "id"],
              CUTTING: ["CUTTING", "id"],
            },
          ],
        })
      );
      console.log(result, "total");
      setUserBatik(result as any as UserBatikDetails[]);
      const userBatiks: UserBatikDetails[] = result.map((item: any) => ({
        id: item.id, // Map "identifier" to "id"
        FAMILY_NAME: item.FAMILY_NAME, // Map "familyName" to "FAMILY_NAME"
        NAME: item.NAME,
        SHIRT_SIZE: {
          id: item.SHIRT_SIZE?.id,
          SIZE: item.SHIRT_SIZE?.SIZE,
          status: "",
        },
        CUTTING: { id: item.CUTTING.id, CUTTING: item.CUTTING.CUTTING },
        // Map other properties if needed
      }));

      if (userBatiks) {
        const regFit = userBatiks.filter((item) => item.CUTTING.id == "1");
        const slimFit = userBatiks.filter((item) => item.CUTTING.id == "2");

        setUserBatikRegularFit(regFit);
        const totalAggregateRegFit = countSizesWithSpecialRule(regFit);
        const totalAggregateSlimFit = countSizesWithSpecialRule(slimFit);
        if (regFit) {
          setTotalRegFit(regFit.length);
        }

        if (slimFit) {
          setTotalSlimFit(slimFit.length);
        }

        console.log(totalAggregateSlimFit, "AGG");

        setTotalUserSizeRegFit(totalAggregateRegFit);
        setTotalUserSizeSlimFit(totalAggregateSlimFit);
        setUserBatikSlimFit(slimFit);
      }
      console.log(userBatiks, "After map");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  function countSizesWithSpecialRule(
    data: UserBatikDetails[]
  ): TotalUserBatikSize[] {
    const sizeCounts = data.reduce(
      (acc: Record<string, number>, item: UserBatikDetails) => {
        // Increase the count for the size each time it appears
        acc[item.SHIRT_SIZE.SIZE] = (acc[item.SHIRT_SIZE.SIZE] || 0) + 1;
        return acc;
      },
      {}
    );

    return Object.entries(sizeCounts).map(([size, count]) => ({
      SHIRT_SIZE: size,
      count,
    }));
  }

  useEffect(() => {
    fetchUserBatik();
  }, []);

  return (
    <div className="grid gap-12">
      <section className="grid gap-2">
        <h1>Regular Fit</h1>
        <div className="grid gap-2">
          <Table isStriped aria-label="Example static collection table">
            <TableHeader>
              <TableColumn>CUTTING</TableColumn>
              <TableColumn>SIZE</TableColumn>
              <TableColumn>TOTAL(PCS)</TableColumn>
            </TableHeader>
            <TableBody>
              {totalUserSizeRegFit.map((usr, idx) => (
                <TableRow key={idx + 1}>
                  <TableCell>Regular Fit</TableCell>
                  <TableCell>{usr.SHIRT_SIZE}</TableCell>
                  <TableCell className="text-center">{usr.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="text-end pe-5">
          <span>Subtotal:</span>{" "}
          <span>
            {`${totalRegfit}`} {totalRegfit ? "pcs" : ""}
          </span>
        </div>
      </section>
      <section className="grid gap-2">
        <h1>Slim Fit</h1>
        <div>
          <Table isStriped aria-label="Example static collection table">
            <TableHeader>
              <TableColumn>CUTTING</TableColumn>
              <TableColumn>SIZE</TableColumn>
              <TableColumn>TOTAL(pcs)</TableColumn>
            </TableHeader>
            <TableBody>
              {totalUserSizeSlimFit.map((usr, idx) => (
                <TableRow key={idx + 1}>
                  <TableCell>Slim Fit</TableCell>
                  <TableCell>{usr.SHIRT_SIZE}</TableCell>
                  <TableCell className="text-center">{usr.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="text-end pe-5">
          <span>Subtotal:</span>{" "}
          <span>
            {`${totaSlimFit}`} {totaSlimFit ? "pcs" : ""}
          </span>
        </div>
      </section>
    </div>
  );
}
