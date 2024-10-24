import React from 'react'

function Page() {
  
  return <>
    <DataDisplay
        title={"Overtime entries"}
        data={data || []}
        // searchProps={{
        //   searchingItemKey: [
        //     ["trans_employees_overtimes", "last_name"],
        //     ["trans_employees_overtimes", "first_name"],
        //     ["trans_employees_overtimes", "middle_name"],
        //     ["trans_employees_overtimes", "email"],
        //     ["trans_employees_overtimes_approvedBy", "last_name"],
        //     "date",
        //   ],
        // }}
        // filterProps={{
        //   filterItems: [
        //     {
        //       filtered: [
        //         ...Array.from(
        //           new Map(
        //             data?.map(item => [
        //               item.trans_employees_overtimes.ref_departments.id,
        //               {
        //                 name: item.trans_employees_overtimes.ref_departments.name,
        //                 key: getKey(["trans_employees_overtimes", ["ref_departments", "id"]]),
        //                 value: item.trans_employees_overtimes.ref_departments.id
        //               }
        //             ])
        //           ).values()
        //         ),
        //       ],
        //       category: "Employee Department",
        //     },
        //   ],
        // }}
        onTableDisplay={{
          config: config,
          classNames: { td: "[&:nth-child(n):not(:nth-child(3))]:w-[155px]" },
          layout: "auto",
          onRowAction: (key) => {
            const item = data?.find((item) => item.id === Number(key));
            setSelectedOvertime(item);
            console.log(item);
            setVisible(true);
          },
        }}
        defaultDisplay="table"
        paginationProps={{
          data_length: data?.length,
        }}
      />
  </>
}

export default Page