// Image component removed (use <img> directly);

// 画像のインポート
const TutoVideochatImage = '/tuto/tuto_videochat_1.webp';

const About = () => {
  return (
    <section className="m-[15px] rounded-[20px] bg-white/50 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-[10px]">
      <h1 className="mt-0 mb-[10px] bg-gradient-to-br from-[#a855f7] to-[#ec4899] bg-clip-text text-center font-bold text-[#333] text-[22px] text-transparent">
        ビデオチャットとは？
      </h1>

      <div className="mx-auto mb-[25px] max-w-[800px] rounded-[15px] bg-gradient-to-br from-[#a855f7] to-[#ec4899] p-[15px] text-center">
        <div className="mb-[15px] flex justify-center">
          <Image
            src={TutoVideochatImage}
            alt="ビデオチャットの様子"
            width={300}
            height={200}
            priority
          />
        </div>
        <p className="m-0 font-medium text-[14px] text-white leading-[1.8]">
          ビデオチャットとは、
          <br />
          女の子のライブ配信をリアルタイムで楽しめる機能！
          <br />
          複数の男性が同時に入室でき、 <br />
          １対多でコミュニケーションが楽しめます。
        </p>
      </div>

      <div className="mb-[15px] grid grid-cols-1 gap-5">
        <div className="max-w-full bg-transparent p-[15px] text-center transition-transform hover:-translate-y-[5px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <h2 className="mb-[15px] font-bold text-[#333] text-[18px]">
            ☑️　自身の姿は映さなくてOK！
          </h2>
          <p className="m-0 text-[#666] text-[13px] leading-[1.6]">
            あなたの顔を映す必要はありません。
            <br />
            ビデオ通話と違って一方的に見ることが可能です。
          </p>

          <h2 className="mb-[15px] font-bold text-[#333] text-[18px]">
            ☑️　コメントで配信に参加できる
          </h2>
          <p className="m-0 text-[#666] text-[13px] leading-[1.6]">
            チャットでコミュニケーションができます。
            <br />
            声を出さなくても楽しめます。
          </p>

          <h2 className="mb-[15px] font-bold text-[#333] text-[18px]">
            ☑️　遠隔バイブ送信可能
          </h2>
          <p className="m-0 text-[#666] text-[13px] leading-[1.6]">
            おもちゃを所持している女性には遠隔操作が可能。
            <br />
            リアルな反応を楽しんじゃおう！
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
