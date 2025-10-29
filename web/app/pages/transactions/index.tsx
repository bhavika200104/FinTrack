'use client'

import { Transaction } from '@/client/gen/pft/transaction'
import { TypeEnum } from '@/client/gen/pft/typeEnum'

import { useV1CategoriesList, useV1TransactionsList } from '@/client/gen/pft/v1/v1'
import { AddTransactionDialog } from '@/components/add-transaction-dialog'
import { DeleteTransactionAlert } from '@/components/delete-transaction-alert'
import { EditTransactionDialog } from '@/components/edit-transaction-dialog'
import { AnimateSpinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CurrencyDisplay } from '@/components/ui/currency-display'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyPlaceholder } from '@/components/ui/empty-placeholder'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Typography from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CircleDollarSign,
  Download,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function TransactionsPage() {
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showEditTransaction, setShowEditTransaction] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const [transactionType, setTransactionType] = useState<'all' | 'income' | 'expense'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const { data: transactions, isLoading: isLoadingTransactions } = useV1TransactionsList()

  useEffect(() => {
    if (transactions?.count === 0 && currentPage > 1) {
      setCurrentPage(1)
    }
  }, [transactions?.count, currentPage])

  const { data: categories, isLoading: isLoadingCategories } = useV1CategoriesList()

  if (isLoadingTransactions || isLoadingCategories) {
    return <AnimateSpinner size={64} />
  }

  // Check if there are any categories first
  if (!categories?.results?.length) {
    return (
      <div className='p-6'>
        <EmptyPlaceholder
          icon={<CircleDollarSign className='w-12 h-12' />}
          title='No categories available'
          description='You need to create categories before adding transactions. Head over to the categories page to create some!'
          action={
            <Link to='/categories'>
              <Button>
                <Plus className='mr-2 h-4 w-4' /> Create Categories
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  // Show empty state for no transactions
  if (!transactions?.results?.length) {
    return (
      <div className='p-6'>
        <EmptyPlaceholder
          icon={<CircleDollarSign className='w-12 h-12' />}
          title='No transactions yet'
          description='Start tracking your finances by adding your first transaction.'
          action={<Button onClick={() => setShowAddTransaction(true)}>Add Transaction</Button>}
        />
        <AddTransactionDialog open={showAddTransaction} onOpenChange={setShowAddTransaction} />
      </div>
    )
  }

  const filteredTransactions = Array.isArray(transactions?.results)
    ? transactions?.results
        ?.filter((transaction) => {
          const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesType =
            transactionType === 'all' ||
            (transactionType === 'income' &&
              categories?.results?.find((c) => c.id === transaction.category)?.type ===
                TypeEnum.income) ||
            (transactionType === 'expense' &&
              categories?.results?.find((c) => c.id === transaction.category)?.type ===
                TypeEnum.expense)
          const matchesDate = !date || transaction.transaction_date === format(date, 'yyyy-MM-dd')
          return matchesSearch && matchesType && matchesDate
        })
        .sort((a, b) => {
          switch (sortOrder) {
            case 'newest':
              return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
            case 'oldest':
              return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
            case 'highest':
              return parseFloat(b.amount) - parseFloat(a.amount)
            case 'lowest':
              return parseFloat(a.amount) - parseFloat(b.amount)
            default:
              return 0
          }
        })
    : []

  return (
    <div className='space-y-4 p-6'>
      <div className='flex items-center justify-between'>
        <Typography variant='h2'>Transactions</Typography>
        <Button onClick={() => setShowAddTransaction(true)}>Add Transaction</Button>
      </div>

      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-1 items-center gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search transactions...'
              className='w-full pl-8'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='gap-1'>
                <Filter className='h-4 w-4' /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[200px]'>
              <DropdownMenuCheckboxItem
                checked={transactionType === 'all'}
                onCheckedChange={() => setTransactionType('all')}
              >
                All Transactions
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={transactionType === 'income'}
                onCheckedChange={() => setTransactionType('income')}
              >
                Income Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={transactionType === 'expense'}
                onCheckedChange={() => setTransactionType('expense')}
              >
                Expenses Only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className='gap-1 w-[180px] justify-start'>
                <CalendarIcon className='h-4 w-4' />
                {date ? format(date, 'MMM dd, yyyy') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar mode='single' selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className='flex items-center gap-2'>
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as typeof sortOrder)}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='newest'>Newest first</SelectItem>
              <SelectItem value='oldest'>Oldest first</SelectItem>
              <SelectItem value='highest'>Highest amount</SelectItem>
              <SelectItem value='lowest'>Lowest amount</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='outline' size='icon'>
            <Download className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className='text-left'>Amount</TableHead>
              <TableHead className='w-[80px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingTransactions ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center'>
                  <AnimateSpinner size={14} />
                </TableCell>
              </TableRow>
            ) : filteredTransactions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center'>
                  <EmptyPlaceholder title={''} description={''}>
                    No transactions found
                  </EmptyPlaceholder>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions?.map((transaction) => {
                const category = categories?.results?.find((c) => c.id === transaction.category)
                if (!category) return null

                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>{transaction.title}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {category.type === TypeEnum.income ? (
                          <ArrowUpIcon className='h-4 w-4 text-emerald-600' />
                        ) : (
                          <ArrowDownIcon className='h-4 w-4 text-rose-600' />
                        )}
                        <span
                          className={cn(
                            'tabular-nums',
                            category.type === TypeEnum.income
                              ? 'text-emerald-600'
                              : 'text-rose-600',
                          )}
                        >
                          <CurrencyDisplay amount={parseFloat(transaction.amount)} />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowEditTransaction(true)
                            }}
                          >
                            <Pencil className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowDeleteAlert(true)
                            }}
                            className='text-destructive focus:text-destructive'
                          >
                            <Trash className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          Showing <strong>{filteredTransactions.length}</strong> of{' '}
          <strong>{transactions?.count || 0}</strong> transactions
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={!transactions?.previous}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            disabled={!transactions?.next}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <AddTransactionDialog open={showAddTransaction} onOpenChange={setShowAddTransaction} />
      {selectedTransaction && (
        <>
          <EditTransactionDialog
            open={showEditTransaction}
            onOpenChange={setShowEditTransaction}
            transaction={selectedTransaction}
          />
          <DeleteTransactionAlert
            open={showDeleteAlert}
            onOpenChange={setShowDeleteAlert}
            transactionId={String(selectedTransaction.id)}
            currentPage={currentPage}
          />
        </>
      )}
    </div>
  )
}
