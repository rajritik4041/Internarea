"use client";

import { useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Data = {
  id: number;
  name: string;
  email: string;
  role: string;
  price: number;
  quantity: number;
};

const data: Data[] = [
  {
    id: 1,
    name: "Raj",
    email: "raj@gmail.com",
    role: "Developer",
    price: 500,
    quantity: 2,
  },
  {
    id: 2,
    name: "Aman",
    email: "aman@gmail.com",
    role: "Designer",
    price: 750,
    quantity: 3,
  },
  {
    id: 3,
    name: "Rahul",
    email: "rahul@gmail.com",
    role: "Developer",
    price: 1200,
    quantity: 1,
  },
  {
    id: 4,
    name: "Priya",
    email: "priya@gmail.com",
    role: "Manager",
    price: 1500,
    quantity: 4,
  },
  {
    id: 5,
    name: "Ankit",
    email: "ankit@gmail.com",
    role: "Developer",
    price: 900,
    quantity: 2,
  },
  {
    id: 6,
    name: "Neha",
    email: "neha@gmail.com",
    role: "Designer",
    price: 1800,
    quantity: 1,
  },
  {
    id: 7,
    name: "Rohit",
    email: "rohit@gmail.com",
    role: "Tester",
    price: 650,
    quantity: 5,
  },
  {
    id: 8,
    name: "Sneha",
    email: "sneha@gmail.com",
    role: "Developer",
    price: 2200,
    quantity: 2,
  },
  {
    id: 9,
    name: "Vivek",
    email: "vivek@gmail.com",
    role: "Manager",
    price: 3000,
    quantity: 1,
  },
  {
    id: 10,
    name: "Pooja",
    email: "pooja@gmail.com",
    role: "Designer",
    price: 1100,
    quantity: 3,
  },
  {
    id: 11,
    name: "Arjun",
    email: "arjun@gmail.com",
    role: "Developer",
    price: 950,
    quantity: 2,
  },
  {
    id: 12,
    name: "Karan",
    email: "karan@gmail.com",
    role: "Tester",
    price: 1350,
    quantity: 4,
  },
  {
    id: 13,
    name: "Simran",
    email: "simran@gmail.com",
    role: "Developer",
    price: 1700,
    quantity: 2,
  },
  {
    id: 14,
    name: "Mohit",
    email: "mohit@gmail.com",
    role: "Designer",
    price: 800,
    quantity: 5,
  },
  {
    id: 15,
    name: "Nisha",
    email: "nisha@gmail.com",
    role: "Manager",
    price: 2500,
    quantity: 1,
  },
  {
    id: 16,
    name: "Deepak",
    email: "deepak@gmail.com",
    role: "Developer",
    price: 1400,
    quantity: 3,
  },
  {
    id: 17,
    name: "Riya",
    email: "riya@gmail.com",
    role: "Tester",
    price: 600,
    quantity: 2,
  },
  {
    id: 18,
    name: "Saurabh",
    email: "saurabh@gmail.com",
    role: "Developer",
    price: 2000,
    quantity: 1,
  },
  {
    id: 19,
    name: "Anjali",
    email: "anjali@gmail.com",
    role: "Designer",
    price: 1250,
    quantity: 4,
  },
  {
    id: 20,
    name: "Vikas",
    email: "vikas@gmail.com",
    role: "Manager",
    price: 3500,
    quantity: 2,
  },
  {
    id: 21,
    name: "Akash",
    email: "akash@gmail.com",
    role: "Developer",
    price: 1050,
    quantity: 3,
  },
  {
    id: 22,
    name: "Kavita",
    email: "kavita@gmail.com",
    role: "Tester",
    price: 700,
    quantity: 5,
  },
  {
    id: 23,
    name: "Sumit",
    email: "sumit@gmail.com",
    role: "Developer",
    price: 1600,
    quantity: 2,
  },
  {
    id: 24,
    name: "Shivani",
    email: "shivani@gmail.com",
    role: "Designer",
    price: 1900,
    quantity: 1,
  },
  {
    id: 25,
    name: "Manish",
    email: "manish@gmail.com",
    role: "Developer",
    price: 1300,
    quantity: 3,
  },
  {
    id: 26,
    name: "Komal",
    email: "komal@gmail.com",
    role: "Manager",
    price: 2800,
    quantity: 2,
  },
  {
    id: 27,
    name: "Abhishek",
    email: "abhishek@gmail.com",
    role: "Developer",
    price: 1550,
    quantity: 4,
  },
  {
    id: 28,
    name: "Isha",
    email: "isha@gmail.com",
    role: "Tester",
    price: 850,
    quantity: 2,
  },
  {
    id: 29,
    name: "Varun",
    email: "varun@gmail.com",
    role: "Designer",
    price: 2100,
    quantity: 1,
  },
  {
    id: 30,
    name: "Aditi",
    email: "aditi@gmail.com",
    role: "Developer",
    price: 1750,
    quantity: 3,
  },
];

export default function UserCards() {
  // Default: show all prices
  const [columnFilters, setColumnFilters] = useState<any[]>([
    {
      id: "price",
      value: ["0", "3500"],
    },
  ]);

  const columns = [
    // ================= ID =================
    {
      accessorKey: "id",
      header: "ID",

      filterFn: (
        row: any,
        columnId: string,
        value: [string, string]
      ) => {
        const [min, max] = value || ["", ""];

        const id = Number(row.getValue(columnId));

        if (min !== "" && id < Number(min)) {
          return false;
        }

        if (max !== "" && id > Number(max)) {
          return false;
        }

        return true;
      },
    },

    // ================= NAME =================
    {
      accessorKey: "name",
      header: "Name",
    },

    // ================= EMAIL =================
    {
      accessorKey: "email",
      header: "Email",
    },

    // ================= ROLE =================
    {
      accessorKey: "role",
      header: "Role",

      filterFn: (
        row: any,
        columnId: string,
        value: string[]
      ) => {
        if (!value || value.length === 0) {
          return true;
        }

        return value.includes(
          row.getValue(columnId)
        );
      },
    },

    // ================= PRICE =================
    {
      accessorKey: "price",
      header: "Price",

      filterFn: (
        row: any,
        columnId: string,
        value: [string, string]
      ) => {
        const [min, max] = value || ["0", "3500"];

        const price = Number(row.getValue(columnId));

        // Price minimum
        if (
          min !== "" &&
          price < Number(min)
        ) {
          return false;
        }

        // Price maximum
        if (
          max !== "" &&
          price > Number(max)
        ) {
          return false;
        }

        return true;
      },
    },

    // ================= QUANTITY =================
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
  ];

  const table = useReactTable({
    data,
    columns,

    state: {
      columnFilters,
    },

    onColumnFiltersChange: setColumnFilters,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),
  });

  // Get filter value
  const getFilterValue = (columnId: string) => {
    return table
      .getColumn(columnId)
      ?.getFilterValue();
  };

  // ================= ROLE CHECKBOX =================

  const handleRoleChange = (
    role: string,
    checked: boolean
  ) => {
    const column = table.getColumn("role");

    const current =
      (column?.getFilterValue() as string[]) || [];

    if (checked) {
      column?.setFilterValue([
        ...current,
        role,
      ]);
    } else {
      column?.setFilterValue(
        current.filter(
          (item) => item !== role
        )
      );
    }
  };

  // ================= PRICE =================

  const priceFilter =
    (getFilterValue("price") as [
      string,
      string
    ]) || ["0", "3500"];

  const currentPrice =
    priceFilter[0] || "0";

  // Slider percentage
  const pricePercentage =
    (Number(currentPrice) / 3500) * 100;

  return (
    <div className="p-6">

      {/* ================================================= */}
      {/* FILTER BOX */}
      {/* ================================================= */}

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Filters
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* ================= ID RANGE ================= */}

          <div>
            <label className="mb-2 block font-semibold">
              ID Range
            </label>

            <div className="flex gap-2">

              {/* MIN ID */}

              <input
                type="number"
                placeholder="Min"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                value={
                  ((getFilterValue("id") as [
                    string,
                    string
                  ])?.[0]) || ""
                }
                onChange={(e) => {

                  const current =
                    (getFilterValue("id") as [
                      string,
                      string
                    ]) || ["", ""];

                  table
                    .getColumn("id")
                    ?.setFilterValue([
                      e.target.value,
                      current[1],
                    ]);
                }}
              />

              {/* MAX ID */}

              <input
                type="number"
                placeholder="Max"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                value={
                  ((getFilterValue("id") as [
                    string,
                    string
                  ])?.[1]) || ""
                }
                onChange={(e) => {

                  const current =
                    (getFilterValue("id") as [
                      string,
                      string
                    ]) || ["", ""];

                  table
                    .getColumn("id")
                    ?.setFilterValue([
                      current[0],
                      e.target.value,
                    ]);
                }}
              />

            </div>
          </div>

          {/* ================= NAME ================= */}

          <div>
            <label className="mb-2 block font-semibold">
              Name
            </label>

            <input
              type="text"
              placeholder="Search name..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
              value={
                (getFilterValue("name") as string) || ""
              }
              onChange={(e) =>
                table
                  .getColumn("name")
                  ?.setFilterValue(
                    e.target.value
                  )
              }
            />
          </div>

          {/* ================= EMAIL ================= */}

          <div>
            <label className="mb-2 block font-semibold">
              Email
            </label>

            <input
              type="text"
              placeholder="Search email..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
              value={
                (getFilterValue("email") as string) || ""
              }
              onChange={(e) =>
                table
                  .getColumn("email")
                  ?.setFilterValue(
                    e.target.value
                  )
              }
            />
          </div>

          {/* ================= ROLE ================= */}

          <div>
            <label className="mb-2 block font-semibold">
              Role
            </label>

            <div className="space-y-2">

              {[
                "Developer",
                "Designer",
                "Manager",
                "Tester",
              ].map((role) => {

                const selected =
                  (getFilterValue("role") as string[]) || [];

                return (
                  <label
                    key={role}
                    className="flex cursor-pointer items-center gap-2"
                  >

                    <input
                      type="checkbox"
                      checked={selected.includes(
                        role
                      )}
                      onChange={(e) =>
                        handleRoleChange(
                          role,
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 cursor-pointer accent-blue-600"
                    />

                    <span>
                      {role}
                    </span>

                  </label>
                );
              })}

            </div>
          </div>

          {/* ================================================= */}
          {/* PRICE SLIDER */}
          {/* ================================================= */}

          <div className="md:col-span-2 lg:col-span-4">

            <div className="max-w-2xl">

              {/* PRICE TITLE */}

              <div className="mb-5 flex items-center justify-between">

                <label className="text-lg font-medium">
                  Price
                </label>

                <span className="text-xl font-bold text-blue-600">
                  ₹
                  {Number(currentPrice).toLocaleString(
                    "en-IN"
                  )}
                  +
                </span>

              </div>

              {/* SLIDER */}

              <input
                type="range"
                min="0"
                max="3500"
                step="100"
                value={currentPrice}
                onChange={(e) => {

                  const value =
                    e.target.value;

                  // IMPORTANT:
                  // Selected price = MINIMUM price
                  //
                  // Example:
                  // 800 => price >= 800
                  //
                  table
                    .getColumn("price")
                    ?.setFilterValue([
                      value,
                      "3500",
                    ]);
                }}
                style={{
                  background: `linear-gradient(
                    to right,
                    #1683ea 0%,
                    #1683ea ${pricePercentage}%,
                    #e5e7eb ${pricePercentage}%,
                    #e5e7eb 100%
                  )`,
                }}
                className="price-slider w-full"
              />

              {/* LABELS */}

              <div className="mt-3 flex justify-between text-sm text-gray-500">

                <span>₹0</span>
                <span>₹500</span>
                <span>₹1000</span>
                <span>₹1500</span>
                <span>₹2000</span>
                <span>₹2500</span>
                <span>₹3000</span>
                <span>₹3500</span>

              </div>

              {/* FILTER DESCRIPTION */}

              <p className="mt-3 text-sm text-gray-500">
                Showing users with price ₹
                {Number(currentPrice).toLocaleString(
                  "en-IN"
                )}{" "}
                and above
              </p>

            </div>
          </div>

        </div>
      </div>

      {/* ================================================= */}
      {/* USER CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {table
          .getRowModel()
          .rows
          .map((row) => {

            const user =
              row.original as Data;

            // Price × Quantity
            const total =
              user.price *
              user.quantity;

            return (
              <div
                key={row.id}
                className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm transition hover:shadow-md"
              >

                {/* NAME + ROLE */}

                <div className="mb-4 flex items-center justify-between">

                  <h2 className="text-lg font-bold">
                    {user.name}
                  </h2>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600">
                    {user.role}
                  </span>

                </div>

                {/* DETAILS */}

                <div className="space-y-2">

                  <p>
                    <b>ID:</b>{" "}
                    {user.id}
                  </p>

                  <p>
                    <b>Email:</b>{" "}
                    {user.email}
                  </p>

                  <p>
                    <b>Price:</b>{" "}
                    ₹
                    {user.price.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <p>
                    <b>Quantity:</b>{" "}
                    {user.quantity}
                  </p>

                  {/* TOTAL */}

                  <div className="mt-3 border-t pt-3 text-lg font-bold">

                    Total: ₹
                    {total.toLocaleString(
                      "en-IN"
                    )}

                  </div>

                </div>

              </div>
            );
          })}

        {/* NO RESULT */}

        {table
          .getRowModel()
          .rows
          .length === 0 && (

          <div className="col-span-full rounded-xl border p-8 text-center text-gray-500">
            No users found
          </div>
        )}

      </div>

    </div>
  );
}