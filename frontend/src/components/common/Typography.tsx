import React, { ReactNode } from 'react';
import styled from '@emotion/styled';

export type TypographyVariant =
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'subtitle1' | 'subtitle2'
    | 'body1' | 'body2'
    | 'caption' | 'overline';

export type TypographyColor = 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'inherit';


interface TypographyProps {
    children: ReactNode;
    variant?: TypographyVariant;
    color?: TypographyColor;
    align?: 'left' | 'center' | 'right' | 'justify';
    gutterBottom?: boolean;
    noWrap?: boolean;
    paragraph?: boolean;
    component?: keyof JSX.IntrinsicElements;
    fontWeight?: 'normal' | 'bold' | 'light' | number;
    fontStyle?: 'normal' | 'italic' | 'oblique';
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    rel?: string;
    style?: React.CSSProperties;
}

const variantMapping: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle1: 'h6',
    subtitle2: 'h6',
    body1: 'p',
    body2: 'p',
    caption: 'span',
    overline: 'span',
};

const StyledTypography = styled.p<TypographyProps>(({ theme, variant, color, align, gutterBottom, noWrap, paragraph, fontWeight }) => ({
    margin: 0,
    padding: 0,
    textAlign: align,
    fontWeight: fontWeight || 'normal',
    color: color
        ? color === 'inherit'
            ? 'inherit'
            : color.includes('text')
                ? theme.palette.text[color.replace('text', '').toLowerCase() as 'primary' | 'secondary']
                : theme.palette[color as 'primary' | 'secondary']?.main
        : theme.palette.text.primary,
    marginBottom: gutterBottom ? theme.spacing(2) : 0,
    whiteSpace: noWrap ? 'nowrap' : 'normal',
    display: 'inline',

    ...(variant === 'h1' && { fontSize: '2.5rem', fontWeight: 700 }),
    ...(variant === 'h2' && { fontSize: '2rem', fontWeight: 600 }),
    ...(variant === 'h3' && { fontSize: '1.75rem', fontWeight: 500 }),
    ...(variant === 'h4' && { fontSize: '1.5rem', fontWeight: 500 }),
    ...(variant === 'h5' && { fontSize: '1.25rem', fontWeight: 500 }),
    ...(variant === 'h6' && { fontSize: '1rem', fontWeight: 500 }),
    ...(variant === 'subtitle1' && { fontSize: '0.875rem', fontWeight: 400 }),
    ...(variant === 'subtitle2' && { fontSize: '0.75rem', fontWeight: 400 }),
    ...(variant === 'body1' && { fontSize: '1rem', fontWeight: 400 }),
    ...(variant === 'body2' && { fontSize: '0.875rem', fontWeight: 400 }),
    ...(variant === 'caption' && { fontSize: '0.875rem', opacity: 0.7 }),
    ...(variant === 'overline' && { fontSize: '0.875rem', textTransform: 'uppercase' }),
}));


export function Typography(props: TypographyProps) {
    const { children, variant = 'body1', color, align, gutterBottom, noWrap, paragraph, component, fontWeight, fontStyle, href, target, rel, ...rest } = props;
    const Component = component || variantMapping[variant] || 'p';

    return (
        <StyledTypography
            as={Component}
            variant={variant}
            color={color}
            align={align}
            gutterBottom={gutterBottom}
            noWrap={noWrap}
            paragraph={paragraph}
            fontWeight={fontWeight}
            fontStyle={fontStyle}
            href={href}
            target={href ? target : undefined}
            rel={href ? rel : undefined}
            {...rest}
        >
            {children}
        </StyledTypography>
    );
};