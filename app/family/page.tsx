"use client";
import { MdDelete, MdEdit } from "react-icons/md";
import { createDirectus, rest, readItems, authentication } from "@directus/sdk";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Input } from "@nextui-org/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { SharedSelection } from "@nextui-org/system";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { useEffect, useState } from "react";

import { collection, endpoint } from "@/config/API";
import { Cutting, FamilyGroup, Size, UserBatikDetails } from "@/config/model";

export default function PricingPage() {
  // const client = createDirectus(endpoint.url).with(rest());
  const client = createDirectus(endpoint.url)
    .with(authentication("cookie", { credentials: "omit", autoRefresh: true }))
    .with(rest({ credentials: "same-origin" }));
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [userBatik, setUserBatik] = useState<UserBatikDetails[]>([]);
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup[]>([]);
  const [shirtSize, setShirtSize] = useState<Size[]>([]);
  const [cuttingStyle, setCuttingStyle] = useState<Cutting[]>([]);
  const [loading, setLoading] = useState<Boolean>(false);
  const [familyName, setFamilyName] = useState<String>("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [nameValue, setNameValue] = useState("");
  // const [selectedKeys, setSelectedKeys] = useState(new Set(["Pilih Size"]));
  const [isEdit, setIsEdit] = useState<Boolean>(false);
  const [selectedSize, setSelectedSize] = useState<Set<string>>(new Set());
  const [selectedValueSize, setSelectedValueSize] =
    useState<string>("Select size");

  const [selectedCutting, setSelectedCutting] = useState<Set<string>>(
    new Set(),
  );
  const [tableKey, setTableKey] = useState(0);

  const [selectedValueCutting, setSelectedValueCutting] =
    useState<string>("Select Cutting");
  const [userId, setUserId] = useState<String>("");
  // const selectedValue = useMemo(
  //   () => Array.from(selectedSize).join(", ").replaceAll("_", " "),
  //   [selectedSize]
  // );
  const handleSelectionChange = (keys: SharedSelection) => {
    setSelectedSize(new Set(Array.from(keys as Set<string>))); // Casting keys to Set<string>
  };

  useEffect(() => {
    // Extract the id from the query parameters
    const params = new URLSearchParams(location.search);
    const fetchedId = params.get("id");

    // Set the id in state
    if (fetchedId) {
      setFamilyId(fetchedId);
      fetchUserBatik(fetchedId);
      fetchFamily(fetchedId);
    }
  }, []);
  // const id = params.get("id");

  const closeModal = () => {
    onOpenChange(); // Set isOpen to false to close the modal
  };

  const fetchFamily = async (id: string | null) => {
    try {
      console.log(id);
      const result = await client.request(
        readItems(collection.familyGroup, {
          filter: {
            // status: { _eq: "published" },
            id: { _eq: `${id}` },
          },
          fields: [
            "id",
            "FAMILY_NAME",
            // "SHIRT_SIZE.SIZE",
          ],
        }),
      );

      setFamilyGroup(result as any as FamilyGroup[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchUserBatik = async (id: string | null) => {
    try {
      console.log(id);
      const result = await client.request(
        readItems(collection.userBatikDetails, {
          filter: {
            // status: { _eq: "published" },
            FAMILY_NAME: { _eq: `${id}` },
          },
          fields: [
            "id",
            "FAMILY_NAME",
            "NAME",
            // "SHIRT_SIZE.SIZE",
            {
              SHIRT_SIZE: ["SIZE"],
              CUTTING: ["CUTTING"],
            },
          ],
        }),
      );

      setUserBatik(result as any as UserBatikDetails[]);
      setLoading(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //GET SIZE LIST
  const fetchSize = async () => {
    try {
      const result = await client.request(
        readItems(collection.size, {
          filter: {
            status: { _eq: "published" },
          },
          fields: ["SIZE", "id"],
        }),
      );

      setShirtSize(result as any as Size[]);
      setLoading(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //GET CUTTING LIST
  const fetchCutting = async () => {
    try {
      const result = await client.request(
        readItems(collection.cutting, {
          filter: {
            status: { _eq: "published" },
          },
          fields: ["CUTTING", "id"],
        }),
      );

      setCuttingStyle(result as any as Cutting[]);
      // setLoading(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updatePost = async (formData: {
    NAME: string;
    SHIRT_SIZE: string;
    FAMILY_NAME: string | null;
    CUTTING: string;
  }) => {
    // const { id, title, content, userId } = formData;
    try {
      // Make a POST request to add a new post
      const response = await fetch(`${endpoint.userBatikEndpoint}/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive", // Set the content type to JSON
          // 'Authorization': `Bearer ${token}`, // Pass the token for authorization
        },
        body: JSON.stringify(formData),
      });

      // Check if the response is okay
      if (response.ok) {
        const result = await response.json();

        closeModal();
        console.log("Success: Post edited", result);
        fetchUserBatik(familyId);
      } else {
        // Handle API errors
        const errorData = await response.json();

        console.error("Error adding post:", errorData);

        return { error: "Something went wrong!" };
      }
    } catch (err) {
      console.error("Request error:", err);

      return { error: "Something went wrong!" };
    }
  };

  //ADDING DATA
  const addPost = async (formData: {
    NAME: string;
    SHIRT_SIZE: string;
    FAMILY_NAME: string | null;
    CUTTING: string;
  }) => {
    // const { NAME, SIZE, FAMILY_NAME } = Object.fromEntries(formData);

    try {
      // Make a POST request to add a new post
      const response = await fetch(endpoint.userBatikEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive", // Set the content type to JSON
          // 'Authorization': `Bearer ${token}`, // Pass the token for authorization
        },
        body: JSON.stringify(formData),
      });

      // Check if the response is okay
      if (response.ok) {
        const result = await response.json();

        closeModal();
        console.log("Success: Post added", result);
        true;
        fetchUserBatik(familyId);
        refreshTable();
      } else {
        // Handle API errors
        const errorData = await response.json();

        console.error("Error adding post:", errorData);

        return { error: "Something went wrong!" };
      }
    } catch (err) {
      console.error("Request error:", err);

      return { error: "Something went wrong!" };
    }
  };

  const deleteData = async (id: any) => {
    // const { NAME, SIZE, FAMILY_NAME } = Object.fromEntries(formData);

    try {
      // Make a POST request to add a new post
      const response = await fetch(`${endpoint.userBatikEndpoint}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive", // Set the content type to JSON
          // 'Authorization': `Bearer ${token}`, // Pass the token for authorization
        },
        // body:"{",
      });

      // Check if the response is okay
      if (response.ok) {
        const result = await response;

        console.log("Success: delete data", result);
        true;
        fetchUserBatik(familyId);
        // refreshTable();
      } else {
        // Handle API errors
        const errorData = await response.json();

        console.error("Error adding post:", errorData);

        return { error: "Something went wrong!" };
      }
    } catch (err) {
      console.error("Request error:", err);

      return { error: "Something went wrong!" };
    }
  };

  const handleUpdateBtn = () => {
    let filterSize = shirtSize.filter((size) => size.SIZE == selectedValueSize);
    let filterCutting = cuttingStyle.filter(
      (cut) => cut.CUTTING == selectedValueCutting,
    );
    let sizeId = filterSize[0].id;
    let cuttingId = filterCutting[0].id;
    let newData = {
      NAME: nameValue,
      SHIRT_SIZE: sizeId,
      FAMILY_NAME: familyId,
      CUTTING: cuttingId,
    };

    updatePost(newData);
  };

  const handleAddBtn = () => {
    let newData = {
      NAME: nameValue,
      SHIRT_SIZE: Array.from(selectedSize)[0],
      FAMILY_NAME: familyId,
      CUTTING: Array.from(selectedCutting)[0],
    };

    addPost(newData);
  };

  const handleDeleteBtn = (id: any) => {
    console.log(id, "ELETE ID");
    deleteData(id);
  }

  const handleUpdateOrAdd = (action: String, data: UserBatikDetails | null) => {
    if (action == "add") {
      setIsEdit(false);
      setNameValue("");
      setSelectedValueSize("Select Size");
      setSelectedValueCutting("Select Cutting");
      closeModal()
    } else {
      //if edit
      setIsEdit(true);
      if (data != null) {
        setNameValue(data.NAME);
        setSelectedValueSize(data.SHIRT_SIZE.SIZE);
        setSelectedValueCutting(data.CUTTING.CUTTING);
        setUserId(data.id);
        closeModal();
      }
    }
  };

  const refreshTable = () => {
    console.log(tableKey, "tableKEY");
    setTableKey((prevKey) => prevKey + 1); // Change the key to force re-render
  };

  useEffect(() => {
    fetchSize();
  }, []);

  useEffect(() => {
    fetchCutting();
  }, []);

  return (
    <div className="grid gap-3">
      <div>
        <div>
          Keluarga{" "}
          {familyGroup.length != 0 ? familyGroup[0].FAMILY_NAME : <span />}
        </div>
        <Table aria-label="Example static collection table">
          <TableHeader>
            {/* <TableColumn>NO</TableColumn> */}
            <TableColumn>NAMA</TableColumn>
            <TableColumn>SAIZ BAJU</TableColumn>
            <TableColumn>JENIS CUTTING</TableColumn>
            <TableColumn>ACTION</TableColumn>
          </TableHeader>
          {userBatik.length == 0 ? (
            <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
          ) : (
            <TableBody>
              {userBatik.map((usr, idx) => (
                <TableRow key={usr.id}>
                  {/* <TableCell>{idx + 1}</TableCell> */}
                  <TableCell>{usr.NAME}</TableCell>
                  <TableCell>{usr.SHIRT_SIZE?.SIZE}</TableCell>
                  <TableCell>{usr?.CUTTING?.CUTTING}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button
                      isIconOnly
                      color="primary"
                      size="md"
                      onClick={() => handleUpdateOrAdd("edit", usr)}
                      // onPress={onOpen}
                    >
                      <MdEdit />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      size="md"
                      onClick={() => handleDeleteBtn(usr.id)}
                    >
                      <MdDelete />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>
      <div className="text-end">
        <Button
          color="primary"
          onClick={() => handleUpdateOrAdd("add", null)}
          // onPress={onOpen}
        >
          Tambah
        </Button>
      </div>

      {/* ADD DATA MODAL START*/}
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
              <ModalBody>
                <Input
                  // autoFocus
                  // endContent={
                  //   <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  // }
                  required
                  label="Nama"
                  placeholder="Isi Nama"
                  value={nameValue}
                  variant="bordered"
                  onValueChange={setNameValue}
                />

                <Dropdown>
                  <DropdownTrigger>
                    <Button className="capitalize" variant="bordered">
                      {selectedValueSize}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disallowEmptySelection
                    aria-label="Single selection example"
                    selectedKeys={selectedSize}
                    selectionMode="single"
                    variant="flat"
                    onSelectionChange={(keys) => {
                      setSelectedSize(new Set(Array.from(keys as Set<string>)));
                      const selectedId = Array.from(keys)[0];

                      setSelectedValueSize(
                        shirtSize.find((size) => size.id == selectedId)?.SIZE ||
                          "Select size",
                      );
                    }}
                  >
                    {shirtSize.map((size) => (
                      <DropdownItem key={size.id}>{size.SIZE}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>

                {/* cutting style DD */}
                <Dropdown>
                  <DropdownTrigger>
                    <Button className="capitalize" variant="bordered">
                      {selectedValueCutting}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disallowEmptySelection
                    aria-label="Single selection example"
                    selectedKeys={selectedCutting}
                    selectionMode="single"
                    variant="flat"
                    onSelectionChange={(keys) => {
                      setSelectedCutting(
                        new Set(Array.from(keys as Set<string>)),
                      );
                      const selectedId = Array.from(keys)[0];

                      setSelectedValueCutting(
                        cuttingStyle.find((cut) => cut.id == selectedId)
                          ?.CUTTING || "Select Cutting",
                      );
                    }}
                  >
                    {cuttingStyle.map((cut) => (
                      <DropdownItem key={cut.id}>{cut.CUTTING}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                {!isEdit ? (
                  <Button color="primary" onPress={handleAddBtn}>
                    Add
                  </Button>
                ) : (
                  <Button color="primary" onPress={handleUpdateBtn}>
                    Update
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* ADD DATA MODAL END */}
    </div>
  );
}
