/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
export const scrollToBottom = (chatContainerRef: React.RefObject<HTMLDivElement>) => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
};

export const scrollToFirstItem = (firstItemRef: React.RefObject<HTMLDivElement>) => {
    if (firstItemRef.current) {
        firstItemRef.current.scrollIntoView({ behavior: 'smooth' });
    }
};

export const handleScroll = (
    chatContainerRef: React.RefObject<HTMLDivElement>,
    autoScrollEnabledRef: React.MutableRefObject<boolean>,
    setShowScrollButton: (show: boolean) => void,
    SCROLL_THRESHOLD: number
) => {
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current!;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= SCROLL_THRESHOLD;
    autoScrollEnabledRef.current = isAtBottom;
    setShowScrollButton(!isAtBottom);
};
