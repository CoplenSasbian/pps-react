/**
 * 简单描述
 */
interface DescriptItem {
  title: string;
  '25%': number;
  '50%': number;
  '75%': number;
  count: number;
  max: number;
  mean: number; //平均值
  min: number;
  std: number; //标准差
}
/**
 * 缺失值和数据类型 整合（供显示）
 */
interface Info {
  title: string;
  type: string;
  null: number;
  total: number;
}
interface InfoShow {
  title: string;
  type: string;
  null: number;
  total: number;
  missingMethod: string;
  default: string;
  use: string;
}

/**
 * 数据类型
 */
interface DataType {
  title: string;
  type: string;
}
/**
 * 缺失信息（后台的结构体）
 */
interface MIssingInfo {
  title: string;
  nullCount: number;
  total: number;
  missingMethod: string;
  default: string;
}
/**
 * 缺失信息（缺失处理信息）
 */
interface MissingFixing {
  title: string;
  option: any; //缺失处理
}
/**
 * 每个分箱
 */
interface BinningInfo {
  bin: string;
  woe: number;
  iv: number;
}
/**
 * 分箱信息
 */
interface Binning {
  title: string;
  bins: BinningInfo[];
  iv: number;
  woe: number;
}
/**
 * roc曲线信息
 */
interface rocData {
  truePositiveRate: number;
  falstPositiveRate: number;
}
