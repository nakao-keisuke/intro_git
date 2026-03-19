import { Link } from '@tanstack/react-router';
import type React from 'react';

type Props = {
  href: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  tabText?: string;
};

export const ArticleLinkBox: React.FC<Props> = ({
  href,
  imageSrc,
  imageAlt,
  title,
  tabText = '詳しく見る',
}) => {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ margin: '2rem 0', position: 'relative' }}>
        <div
          style={{
            backgroundColor: '#ff69b4',
            color: 'white',
            padding: '0.3rem 0.8rem',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'inline-block',
            borderTopLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            border: '1px solid #ff69b4',
            borderBottom: 'none',
            borderRight: 'none',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {tabText}
        </div>
        <div
          style={{
            marginTop: '0',
            border: '1px solid #ff69b4',
            borderRadius: '8px',
            backgroundColor: '#fff',
            overflow: 'hidden',
            borderTopLeftRadius: '0',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.8rem',
            }}
          >
            <div
              style={{
                flex: '0 0 auto',
                marginRight: '1rem',
              }}
            >
              <img
                src={imageSrc}
                alt={imageAlt}
                style={{
                  width: '160px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  transition: 'opacity 0.2s ease',
                }}
                loading="lazy"
              />
            </div>
            <div
              style={{
                flex: '1',
              }}
            >
              <h4
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                {title}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
