// Base64 编码函数
function base64Encode(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const encoded = btoa(String.fromCharCode(...data));
  return encoded;
}

// Base64 解码函数
function base64Decode(encoded: string): string {
  const decoded = atob(encoded);
  const decoder = new TextDecoder('utf-8');
  const str = decoder.decode(new Uint8Array([...decoded].map((c) => c.charCodeAt(0))));
  return str;
}


function zip(...arrays: any) {
  const length = Math.min(...arrays.map((arr: string | any[]) => arr.length));
  return Array.from({ length }, (_, i) => arrays.map((arr: any[]) => arr[i]));
}

function o2num(obj: any): any {
  if (typeof obj == 'number') {
    return obj;
  }
  if (typeof obj == 'boolean') {
    return obj ? 1 : 0;
  }
  if (typeof obj == 'string') {
    let sum = 0;
    for (let i = 0; i < obj.length; i++) {
      sum += obj.charCodeAt(i);
    }
    return sum;
  }
  if (typeof obj == 'object') {
    return o2num(JSON.stringify(obj));
  }
  return 0;
}

function getCol(title: any, dataIndex: any, accessor: any = null) {
  return {
    title: title,
    dataIndex: dataIndex,
    sorter: (a: any, b: any) => o2num(a[dataIndex]) - o2num(b[dataIndex]),
    accessor,
  };
}

function getAnchorItem(key: any, title = '', href = '') {
  return {
    key,
    title,
    href,
  };
}

/**
 * 将分箱转换成字符串
 * @param obj
 * @returns
 */
function bin2String(obj: any) {
  if (obj.closed === undefined) {
    return obj;
  }
  let text = '';
  text += obj.closed_left ? '[' : '(';
  text += obj.left;
  text += ',';
  text += obj.right;
  text += obj.closed_right ? ']' : ')';
  return text;
}

export { base64Encode, base64Decode,zip, o2num, getCol, getAnchorItem, bin2String  };
