import { Button } from "@nextui-org/button";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { useMemo, useState } from "react";

export default function Drpdown (ddData:string){
    const [selectedKeys, setSelectedKeys] = useState(new Set(["text"]));
    const selectedValue = useMemo(
        () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
        [selectedKeys]
      );
    return <>
    
    </>
}