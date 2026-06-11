import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (record: T, index: number) => ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: keyof T | ((record: T) => string);
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  emptyText?: string;
  loading?: boolean;
}

function TableInner<T extends object>({
  columns,
  data,
  rowKey,
  className,
  headerClassName,
  rowClassName,
  emptyText = '暂无数据',
  loading = false,
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    if (rowKey && record[rowKey]) {
      return String(record[rowKey]);
    }
    return String(index);
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className={cn('w-full overflow-x-auto rounded-2xl border border-gray-100', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className={cn('bg-gray-50', headerClassName)}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width } : undefined}
                className={cn(
                  'px-4 py-3 font-semibold text-gray-600 whitespace-nowrap',
                  getAlignClass(col.align),
                  col.className
                )}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>加载中...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-gray-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <motion.tr
                key={getRowKey(record, index)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={cn(
                  'border-t border-gray-100 transition-colors hover:bg-primary-50/40',
                  typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-gray-700 whitespace-nowrap',
                      getAlignClass(col.align),
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(record, index)
                      : col.dataIndex
                        ? (record[col.dataIndex] as ReactNode)
                        : null}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

type TableType = <T extends object>(props: TableProps<T>) => JSX.Element;

export default TableInner as TableType;
