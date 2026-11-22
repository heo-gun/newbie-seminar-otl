import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import lodash from 'lodash'


const prisma = new PrismaClient()




function problem1() {
  return prisma.$queryRaw`
    select firstName, lastName, income from Customer
    where income between 50000 and 60000
    order by income desc, lastName, firstName
    limit 10
  `
}

function problem2() {
  return prisma.$queryRaw`
    select e.sin, b.branchName, e.salary, cast(m.salary - e.salary as char) as \`Salary Diff\`
    from Employee e
    join Branch b on e.branchNumber = b.branchNumber
    join Employee m on b.managerSIN = m.sin
    where b.branchName in ('London', 'Berlin')
    order by m.salary - e.salary desc
    limit 10
  `
}

function problem3() {
  return prisma.$queryRaw`
    select firstName, lastName, income from Customer
    where income >= 2 * (select max(income) from Customer where lastName = 'Butler')
    order by lastName, firstName
    limit 10
  `
}

function problem4() {
  return prisma.$queryRaw`
    select c.customerID, c.income, o.accNumber, a.branchNumber
    from Customer c
    join Owns o on c.customerID = o.customerID
    join Account a on o.accNumber = a.accNumber
    where c.income > 80000
      and c.customerID in (select o2.customerID from Owns o2 join Account a2 on o2.accNumber = a2.accNumber join Branch b2 on a2.branchNumber = b2.branchNumber where b2.branchName = 'London')
      and c.customerID in (select o3.customerID from Owns o3 join Account a3 on o3.accNumber = a3.accNumber join Branch b3 on a3.branchNumber = b3.branchNumber where b3.branchName = 'Latveria')
    order by c.customerID, o.accNumber
    limit 10
  `
}

function problem5() {
  return prisma.$queryRaw`
    select o.customerID, a.type, a.accNumber, a.balance
    from Owns o
    join Account a on o.accNumber = a.accNumber
    where a.type in ('BUS', 'SAV')
    order by o.customerID, a.type, a.accNumber
    limit 10
  `
}

function problem6() {
  return prisma.$queryRaw`
    select b.branchName, a.accNumber, a.balance
    from Account a
    join Branch b on a.branchNumber = b.branchNumber
    join Employee e on b.managerSIN = e.sin
    where e.firstName = 'Phillip' and e.lastName = 'Edwards' and a.balance > 100000
    order by a.accNumber
    limit 10
  `
}

function problem7() {
  return prisma.$queryRaw`
    select distinct o.customerID
    from Owns o
    join Account a on o.accNumber = a.accNumber
    join Branch b on a.branchNumber = b.branchNumber
    where b.branchName = 'New York'
      and o.customerID not in (
        select o2.customerID from Owns o2
        join Account a2 on o2.accNumber = a2.accNumber
        join Branch b2 on a2.branchNumber = b2.branchNumber
        where b2.branchName = 'London')
      and o.customerID not in (
        select co.customerID from Owns co
        join Owns lo on co.accNumber = lo.accNumber and co.customerID <> lo.customerID
        where lo.customerID in (
          select o3.customerID from Owns o3
          join Account a3 on o3.accNumber = a3.accNumber
          join Branch b3 on a3.branchNumber = b3.branchNumber
          where b3.branchName = 'London'))
    order by o.customerID
    limit 10
  `
}

function problem8() {
  return prisma.$queryRaw`
    select e.sin, e.firstName, e.lastName, e.salary, b.branchName
    from Employee e
    left join Branch b on e.sin = b.managerSIN
    where e.salary > 50000
    order by b.branchName desc, e.firstName
    limit 10
  `
}

function problem9() {
  return prisma.$queryRaw`
    select e.sin, e.firstName, e.lastName, e.salary,
      (select b.branchName from Branch b where b.managerSIN = e.sin) as branchName
    from Employee e
    where e.salary > 50000
    order by branchName desc, e.firstName
    limit 10
  `
}

function problem10() {
  return prisma.$queryRaw`
    select c.customerID, c.firstName, c.lastName, c.income
    from Customer c
    where c.income > 5000
      and not exists (
        select a.branchNumber from Customer h
        join Owns ho on h.customerID = ho.customerID
        join Account a on ho.accNumber = a.accNumber
        where h.firstName = 'Helen' and h.lastName = 'Morgan'
          and a.branchNumber not in (
            select a2.branchNumber from Owns o2
            join Account a2 on o2.accNumber = a2.accNumber
            where o2.customerID = c.customerID))
    order by c.income desc
    limit 10
  `
}

function problem11() {
  return prisma.$queryRaw`
    select e.sin, e.firstName, e.lastName, e.salary
    from Employee e
    join Branch b on e.branchNumber = b.branchNumber
    where b.branchName = 'Berlin'
      and e.salary = (
        select min(e2.salary) from Employee e2
        join Branch b2 on e2.branchNumber = b2.branchNumber
        where b2.branchName = 'Berlin')
    order by e.sin
    limit 10
  `
}

function problem14() {
  return prisma.$queryRaw`
    select cast(sum(e.salary) as char) as \`sum of employees salaries\`
    from Employee e
    join Branch b on e.branchNumber = b.branchNumber
    where b.branchName = 'Moscow'
  `
}

function problem15() {
  return prisma.$queryRaw`
    select c.customerID, c.firstName, c.lastName
    from Customer c
    join Owns o on c.customerID = o.customerID
    join Account a on o.accNumber = a.accNumber
    group by c.customerID, c.firstName, c.lastName
    having count(distinct a.branchNumber) >= 4
    order by c.lastName, c.firstName
    limit 10
  `
}


function problem17() {
  return prisma.$queryRaw`
    select c.customerID, c.firstName, c.lastName, c.income, avg(a.balance) as \`average account balance\`
    from Customer c
    join Owns o on c.customerID = o.customerID
    join Account a on o.accNumber = a.accNumber
    where c.lastName like 'S%' and c.lastName like '%e%'
    group by c.customerID, c.firstName, c.lastName, c.income
    having count(*) >= 3
    order by c.customerID
    limit 10
  `
}

function problem18() {
  return prisma.$queryRaw`
    select a.accNumber, a.balance, sum(t.amount) as \`sum of transaction amounts\`
    from Account a
    join Branch b on a.branchNumber = b.branchNumber
    join Transactions t on a.accNumber = t.accNumber
    where b.branchName = 'Berlin'
    group by a.accNumber, a.balance
    having count(*) >= 10
    order by \`sum of transaction amounts\`
    limit 10
  `
}

const ProblemList = [
  problem1, problem2, problem3, problem4, problem5, problem6, problem7, problem8, problem9, problem10,
  problem11, problem14, problem15, problem17, problem18
]


async function main() {
  for (let i = 0; i < ProblemList.length; i++) {
    const result = await ProblemList[i]()
    const answer =  JSON.parse(fs.readFileSync(`${ProblemList[i].name}.json`,'utf-8'));
    lodash.isEqual(result, answer) ? console.log(`${ProblemList[i].name}: Correct`) : console.log(`${ProblemList[i].name}: Incorrect`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })