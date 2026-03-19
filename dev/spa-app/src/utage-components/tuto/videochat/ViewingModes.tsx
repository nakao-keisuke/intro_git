const ViewingModes = () => {
  return (
    <section className="mx-[15px] mt-[30px] mb-[15px] rounded-[20px] bg-white/50 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-[20px]">
      <h1 className="mt-0 mb-[25px] bg-gradient-to-br from-[#a855f7] to-[#ec4899] bg-clip-text text-center font-bold text-[#333] text-[22px] text-transparent">
        メインとのぞきの違い
      </h1>

      <div className="mb-[30px] grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-[15px] bg-gradient-to-br from-[#a855f7] to-[#ec4899] p-[25px] text-white shadow-[0_8px_30px_rgba(168,85,247,0.3)]">
          <h2 className="mb-5 font-bold text-[20px]">メイン視聴</h2>
          <div>
            <ul className="list-disc space-y-2 pl-5">
              <li className="text-[15px] leading-[1.8]">
                コメントし放題で積極的に配信に参加できる
              </li>
              <li className="text-[15px] leading-[1.8]">
                女の子がこちらを認知してくれる
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-[15px] bg-gradient-to-br from-[#ec4899] to-[#f97316] p-[25px] text-white shadow-[0_8px_30px_rgba(236,72,153,0.3)]">
          <h2 className="mb-5 font-bold text-[20px]">のぞき視聴</h2>
          <div>
            <ul className="list-disc space-y-2 pl-5">
              <li className="text-[15px] leading-[1.8]">
                相手にバレずにこっそり視聴可能！
              </li>
              <li className="text-[15px] leading-[1.8]">
                視聴後のお礼メッセージなどは届きません
              </li>
              <li className="text-[15px] leading-[1.8]">
                他の人とのやりとりをこっそり視聴
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[15px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white">
              <th className="border border-gray-200 p-3 text-center font-bold text-[16px]">
                機能
              </th>
              <th className="border border-gray-200 p-3 text-center font-bold text-[16px]">
                メイン視聴
              </th>
              <th className="border border-gray-200 p-3 text-center font-bold text-[16px]">
                のぞき視聴
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="transition-colors hover:bg-gray-50">
              <td className="border border-gray-200 p-3 text-center font-medium text-[#333] text-[15px]">
                消費ポイント
              </td>
              <td className="border border-gray-200 p-3 text-center text-[#666] text-[15px]">
                200pt/分
              </td>
              <td className="border border-gray-200 p-3 text-center text-[#666] text-[15px]">
                200pt/分
              </td>
            </tr>
            <tr className="transition-colors hover:bg-gray-50">
              <td className="border border-gray-200 p-3 text-center font-medium text-[#333] text-[15px]">
                コメント
              </td>
              <td className="border border-gray-200 p-3 text-center font-bold text-[#666] text-[15px] text-green-600">
                無料
              </td>
              <td className="border border-gray-200 p-3 text-center text-[#666] text-[15px]">
                200pt/通
              </td>
            </tr>
            <tr className="transition-colors hover:bg-gray-50">
              <td className="border border-gray-200 p-3 text-center font-medium text-[#333] text-[15px]">
                コメントの
                <br />
                公開範囲
              </td>
              <td className="border border-gray-200 p-3 text-center text-[#666] text-[15px]">
                入室者全員
              </td>
              <td className="border border-gray-200 p-3 text-center text-[#666] text-[15px]">
                配信者のみ
              </td>
            </tr>
            <tr className="transition-colors hover:bg-gray-50">
              <td className="border border-gray-200 p-3 text-center font-medium text-[#333] text-[15px]">
                遠隔バイブ
              </td>
              <td className="border border-gray-200 p-3 text-center text-[#666] text-[15px]">
                送信可能
              </td>
              <td className="border border-gray-200 p-3 text-center text-[#666] text-[15px]">
                送信可能
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ViewingModes;
