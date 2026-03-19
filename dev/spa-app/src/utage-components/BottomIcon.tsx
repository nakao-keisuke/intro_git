// Image component removed (use <img> directly);

type Props = {
  file: string;
};

const BottomIcon = ({ file }: Props) => {
  return (
    <div className="relative h-5 w-5 mb-0.5">
      <Image
        src={`/${file}`}
        fill
        style={{ objectFit: 'cover' }}
        alt="アイコン"
      />
    </div>
  );
};

export default BottomIcon;
