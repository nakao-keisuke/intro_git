// Image component removed (use <img> directly);

// 画像のインポート
const VideoScreenImage = '/tuto/videoScreen.webp';

const About = () => {
  return (
    <section className="m-[15px] rounded-[20px] bg-white/50 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-[10px]">
      <h1 className="mt-0 mb-[10px] bg-gradient-to-br from-[#f95757] to-[#ff8a80] bg-clip-text text-center font-bold text-[#333] text-[22px] text-transparent">
        ビデオ通話のたのしみ方
      </h1>

      <div className="mx-auto mb-[25px] max-w-[800px] rounded-[15px] bg-gradient-to-br from-[#f95757] to-[#ff8a80] p-[15px] text-center">
        <div className="mb-[15px] flex justify-center">
          <Image
            src={VideoScreenImage}
            alt="ビデオ通話の様子"
            width={300}
            height={200}
            priority
          />
        </div>
        <p className="m-0 font-medium text-[14px] text-white leading-[1.8]">
          ビデオ通話では、 女の子と1対1でプライベートな時間を楽しめます。
          <br />
          お互いの顔を見ながら、 <br />
          より親密なコミュニケーションが可能です。
        </p>
      </div>

      <div className="mb-[15px] grid grid-cols-1 gap-5">
        <div className="max-w-full bg-transparent p-[15px] text-center transition-transform hover:-translate-y-[5px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <h2 className="mb-[15px] font-bold text-[#333] text-[18px]">
            ☑️　1対1の特別な時間
          </h2>
          <p className="m-0 text-[#666] text-[13px] leading-[1.6]">
            女の子と2人だけの特別な時間を楽しめます。
            <br />
            他の人に邪魔されることなく、親密な会話ができます。
          </p>

          <h2 className="mb-[15px] font-bold text-[#333] text-[18px]">
            ☑️　自分の姿も見せながら通話できる
          </h2>
          <p className="m-0 text-[#666] text-[13px] leading-[1.6]">
            お互いの姿を見ながら通話できるのでより没入感のある通話体験が楽しめます。
            <br />
            姿を映したくない場合はカメラをOFFにすることも可能です。
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
