// export const cardGetRandomColor = (index: number) => {
//     const colors = [
//       "teal",
//       "pink",
//       "violet",
//       "orange",
//       "green",
//       "amber",
//       "red",
//       "yellow",
//       "blue",
//     ];
//     const color = colors[index % colors.length];
//     return {
//       border: [
//         "border-teal-500",
//         "border-pink-500",
//         "border-violet-500",
//         "border-orange-500",
//         "border-green-500",
//         "border-amber-500",
//         "border-red-500",
//         "border-yellow-500",
//         "border-blue-500",
//       ][index % colors.length],
//       hover_border: [
//         "hover:border-teal-500",
//         "hover:border-pink-500",
//         "hover:border-violet-500",
//         "hover:border-orange-500",
//         "hover:border-green-500",
//         "hover:border-amber-500",
//         "hover:border-red-500",
//         "hover:border-yellow-500",
//         "hover:border-blue-500",
//       ][index % colors.length],
//       text: [
//         "text-teal-500",
//         "text-pink-500",
//         "text-violet-500",
//         "text-orange-500",
//         "text-green-500",
//         "text-amber-500",
//         "text-red-500",
//         "text-yellow-500",
//         "text-blue-500",
//       ][index % colors.length],
//       bg: [
//         "bg-teal-100",
//         "bg-pink-100",
//         "bg-violet-100",
//         "bg-orange-100",
//         "bg-green-100",
//         "bg-amber-100",
//         "bg-red-100",
//         "bg-yellow-100",
//         "bg-blue-100",
//       ][index % colors.length],
//     };
//   };

//   // const formatTime = (time: string) => {
//   //   const [hour, minute] = getShortTime(time).split(":");
//   //   const intHour = parseInt(hour);
//   //   const isPM = intHour >= 12;
//   //   const formattedHour = intHour % 12 || 12; // Convert to 12-hour format
//   //   const md = isPM ? "PM" : "AM";
  
//   //   return (
//   //     <div className="flex items-center">
//   //       <h2 className="font-bold text-lg">
//   //         {String(formattedHour).padStart(2, "0")}
//   //       </h2>
//   //       <p>:</p>
//   //       <h2 className="font-bold text-lg">{minute}</h2>
//   //       <h5 className="text-sm">{md}</h5>
//   //     </div>
//   //   );
//   // };