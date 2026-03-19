// Image component removed (use <img> directly);

// 画像のインポート
const TutoChatImage = '/tuto/tuto_chat_1.webp';

const About = () => {
  return (
    <section className="m-[15px] rounded-[20px] bg-white/50 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-[10px]">
      <h1 className="mt-0 mb-[10px] bg-gradient-to-br from-[#e9ab00] to-[#fcc107] bg-clip-text text-center font-bold text-[#333] text-[22px] text-transparent">
        チャットでやり取りしてみよう
      </h1>

      <div className="mx-auto mb-[25px] max-w-[800px] rounded-[15px] bg-gradient-to-br from-[#e9ab00] to-[#fcc107] p-[15px] text-center">
        <div className="mb-[15px] flex justify-center">
          <Image
            src={TutoChatImage}
            alt="chatPic"
            width={300}
            height={200}
            priority
          />
        </div>
        <p className="m-0 font-medium text-[14px] text-white leading-[1.8]">
          チャットでは、女の子と1対1でメッセージのやり取りを楽しめます。
          <br />
          通話や配信と違い時間や場所を選ばず、 <br />
          いつでも気軽にコミュニケーションが可能です。
        </p>
      </div>

      <div className="mb-[15px] grid grid-cols-1 gap-5">
        <div className="max-w-full bg-transparent p-[15px] text-center transition-transform hover:-translate-y-[5px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <h2 className="mb-[15px] font-bold text-[#333] text-[18px]">
            ☑️　誰かとちょっと甘い時間を過ごしたいあなたへ
          </h2>
          <p className="m-0 text-[#666] text-[13px] leading-[1.6]">
            日常のやり取りはもちろん、えっちな会話まで自由に楽しめるから、今の気分にぴったりな関係がきっと見つかる♪
          </p>

          <h2 className="mt-5 mb-[15px] font-bold text-[#333] text-[18px]">
            ☑️　忙しくても癒されたいあなたへ
          </h2>
          <p className="m-0 text-[#666] text-[13px] leading-[1.6]">
            チャットなら返信を急ぐ必要はなし！
            <br />
            スキマ時間でいつでもどこでも気軽に心の距離を縮められます。
          </p>

          <h2 className="mt-5 mb-[15px] font-bold text-[#333] text-[18px]">
            ☑️　写真や動画でじっくり楽しみたいあなたへ
          </h2>
          <p className="m-0 text-[#666] text-[13px] leading-[1.6]">
            チャット上でおねだりすれば、秘密の動画や画像を送ってくれるかも…？
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
