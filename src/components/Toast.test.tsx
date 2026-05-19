import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders success toast with amber background', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Toast message="保存しました" type="success" onDismiss={onDismiss} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.background).toBe('var(--color-accent)');
    expect(screen.getByText('保存しました')).toBeInTheDocument();
  });

  it('renders error toast with red background', () => {
    const { container } = render(<Toast message="エラー" type="error" onDismiss={vi.fn()} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.background).toBe('var(--color-error)');
  });

  it('success toast calls onDismiss after 1500ms', () => {
    const onDismiss = vi.fn();
    render(<Toast message="OK" type="success" onDismiss={onDismiss} />);
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('warning toast calls onDismiss after 3000ms', () => {
    const onDismiss = vi.fn();
    render(<Toast message="警告" type="warning" onDismiss={onDismiss} />);
    act(() => { vi.advanceTimersByTime(2999); });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('replaces active toast when key changes — does not double-render', () => {
    const onDismiss1 = vi.fn();
    const { rerender } = render(<Toast message="first" type="success" onDismiss={onDismiss1} />);
    const onDismiss2 = vi.fn();
    rerender(<Toast message="second" type="warning" onDismiss={onDismiss2} />);
    expect(screen.queryByText('first')).not.toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
  });

  it('overlap warning type suppresses success: warning duration is 3s not 1.5s', () => {
    // When overlap warning shows, it uses 3s duration (not 1.5s like success)
    const onDismiss = vi.fn();
    render(<Toast message="重複あり" type="warning" onDismiss={onDismiss} />);
    act(() => { vi.advanceTimersByTime(1500); });
    // Should NOT have dismissed yet — warning needs 3s
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(onDismiss).toHaveBeenCalled();
  });
});
