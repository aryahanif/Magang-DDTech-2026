import { SanitizePipe } from './sanitize.pipe';

describe('SanitizePipe', () => {
  const pipe = new SanitizePipe();
  const metadata = { type: 'body' } as const;

  it('strips script tags and their contents from a string', () => {
    const result = pipe.transform('<script>alert(1)</script>hello', metadata);
    expect(result).toBe('hello');
  });

  it('strips other HTML tags but keeps the text content', () => {
    const result = pipe.transform('<img src=x onerror=alert(1)>hi', metadata);
    expect(result).toBe('hi');
  });

  it('sanitizes nested string fields inside an object', () => {
    const result = pipe.transform(
      { message: '<b>bold</b> text', nested: { note: '<script>evil()</script>ok' } },
      metadata,
    );
    expect(result).toEqual({ message: 'bold text', nested: { note: 'ok' } });
  });

  it('sanitizes strings inside arrays', () => {
    const result = pipe.transform(['<i>a</i>', '<script>x</script>b'], metadata);
    expect(result).toEqual(['a', 'b']);
  });

  it('leaves non-string primitives untouched', () => {
    expect(pipe.transform(42, metadata)).toBe(42);
    expect(pipe.transform(true, metadata)).toBe(true);
    expect(pipe.transform(null, metadata)).toBe(null);
  });
});
