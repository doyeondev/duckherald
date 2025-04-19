import * as React from "react";
import { cn } from "@/lib/utils";

// 테이블 전체 컨테이너
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  // overflow-auto로 가로 스크롤 가능하게 감싸줌
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)} // 기본 스타일: 전체 너비, 작은 폰트, 캡션은 하단
      {...props}
    />
  </div>
));
Table.displayName = "Table";

// 테이블 헤더 (thead)
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b", className)} // 내부 tr에 border-bottom 적용
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

// 테이블 바디 (tbody)
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)} // 마지막 tr의 border 제거
    {...props}
  />
));
TableBody.displayName = "TableBody";

// 테이블 푸터 (tfoot)
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "bg-primary font-medium text-primary-foreground", // 강조 색상 배경, 흰 글씨
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

// 테이블 행 (tr)
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      // 행에 border, 호버 시 살짝 배경색, 선택 상태일 때는 bg-muted
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

// 테이블 헤더 셀 (th)
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      // 세로 정렬, 글자 스타일, 체크박스 포함 시 오른쪽 패딩 제거
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

// 일반 테이블 셀 (td)
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} // 체크박스 있는 셀은 오른쪽 패딩 제거
    {...props}
  />
));
TableCell.displayName = "TableCell";

// 테이블 캡션 (하단 설명 등)
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)} // 여백 + 설명용 텍스트 스타일
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// 컴포넌트들 export
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

{
  /* <Table>
  <TableHeader>
    <TableRow>
      <TableHead>이름</TableHead>
      <TableHead>이메일</TableHead>
      <TableHead>상태</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>도연</TableCell>
      <TableCell>do@duckmail.com</TableCell>
      <TableCell>활성</TableCell>
    </TableRow>
  </TableBody>
</Table> */
}
