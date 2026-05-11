export const USER_PAGE_SIZE = 6;
export const ACTIVITY_PAGE_SIZE = 8;

export function resolveUserActive(user) {
  return user?.active !== false;
}

export function formatUserRole(role) {
  return String(role || "MANAGER").replace(/_/g, " ");
}

function matchesMonthAndYear(value, month, year) {
  const date = new Date(value);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getMonth() + 1 === month &&
    date.getFullYear() === year
  );
}

function isSameCalendarDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function buildTransactionDailyData(transactions, month, year) {
  const dailyData = {};
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day += 1) {
    dailyData[day] = {
      day,
      count: 0,
      quantity: 0,
      amount: 0,
    };
  }

  transactions.forEach((transaction) => {
    if (!matchesMonthAndYear(transaction?.createdAt, month, year)) {
      return;
    }

    const transactionDate = new Date(transaction.createdAt);
    const day = transactionDate.getDate();

    dailyData[day].count += 1;
    dailyData[day].quantity += Number(transaction?.totalProducts || 0);
    dailyData[day].amount += Number(transaction?.totalPrice || 0);
  });

  return Object.values(dailyData);
}

export function buildUserRoleDistribution(users) {
  const counts = users.reduce((distribution, user) => {
    const role = formatUserRole(user?.role);
    distribution[role] = (distribution[role] || 0) + 1;
    return distribution;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function buildMonthlyTransactionSeries(transactions, monthCount = 6) {
  const today = new Date();
  const buckets = [];

  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const bucketDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    buckets.push({
      key: `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`,
      month: bucketDate.toLocaleString("default", { month: "short" }),
      count: 0,
      amount: 0,
    });
  }

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  transactions.forEach((transaction) => {
    const date = new Date(transaction?.createdAt);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = bucketMap.get(key);

    if (!bucket) {
      return;
    }

    bucket.count += 1;
    bucket.amount += Number(transaction?.totalPrice || 0);
  });

  return buckets;
}

export function buildMonthlyLoginSeries(activityLogs, monthCount = 6) {
  const today = new Date();
  const buckets = [];

  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const bucketDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    buckets.push({
      key: `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`,
      month: bucketDate.toLocaleString("default", { month: "short" }),
      count: 0,
    });
  }

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  activityLogs
    .filter((activity) => activity?.action === "LOGIN")
    .forEach((activity) => {
      const date = new Date(activity?.createdAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const bucket = bucketMap.get(key);

      if (bucket) {
        bucket.count += 1;
      }
    });

  return buckets;
}

export function buildLastLoginMap(activityLogs) {
  const latestLoginMap = new Map();

  activityLogs
    .filter((activity) => activity?.action === "LOGIN")
    .sort(
      (left, right) =>
        new Date(right?.createdAt || 0).getTime() -
        new Date(left?.createdAt || 0).getTime()
    )
    .forEach((activity) => {
      if (!latestLoginMap.has(activity.userId)) {
        latestLoginMap.set(activity.userId, activity.createdAt);
      }
    });

  return latestLoginMap;
}

export function buildUsersView(
  users,
  activityLogs,
  searchTerm,
  sortDirection,
  currentPage,
  pageSize = USER_PAGE_SIZE
) {
  const latestLoginMap = buildLastLoginMap(activityLogs);
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    if (!normalizedSearch) {
      return true;
    }

    return [
      user?.name,
      user?.email,
      user?.phoneNumber,
      formatUserRole(user?.role),
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(normalizedSearch)
      );
  });

  const sortedUsers = [...filteredUsers].sort((left, right) => {
    const result = String(left?.name || "").localeCompare(String(right?.name || ""));
    return sortDirection === "desc" ? result * -1 : result;
  });

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;

  return {
    items: sortedUsers.slice(startIndex, startIndex + pageSize).map((user) => ({
      ...user,
      active: resolveUserActive(user),
      lastLogin: latestLoginMap.get(user.id) || null,
    })),
    currentPage: safePage,
    totalPages,
    totalItems: sortedUsers.length,
  };
}

export function buildLoginActivityView(
  activityLogs,
  searchTerm,
  startDate,
  endDate,
  currentPage,
  pageSize = ACTIVITY_PAGE_SIZE
) {
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();
  const normalizedStartDate = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const normalizedEndDate = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

  const filteredLogs = activityLogs
    .filter((activity) => activity?.action === "LOGIN")
    .filter((activity) => {
      const createdAt = new Date(activity?.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        return false;
      }

      if (
        normalizedStartDate &&
        !Number.isNaN(normalizedStartDate.getTime()) &&
        createdAt < normalizedStartDate
      ) {
        return false;
      }

      if (
        normalizedEndDate &&
        !Number.isNaN(normalizedEndDate.getTime()) &&
        createdAt > normalizedEndDate
      ) {
        return false;
      }

      return true;
    })
    .filter((activity) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        activity?.userName,
        activity?.userEmail,
        activity?.ipAddress,
        activity?.note,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch)
        );
    })
    .sort(
      (left, right) =>
        new Date(right?.createdAt || 0).getTime() -
        new Date(left?.createdAt || 0).getTime()
    );

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;

  return {
    items: filteredLogs.slice(startIndex, startIndex + pageSize),
    currentPage: safePage,
    totalPages,
    totalItems: filteredLogs.length,
  };
}

export function buildOverviewMetrics(users, transactions, activityLogs, month, year) {
  const loginActivities = activityLogs.filter((activity) => activity?.action === "LOGIN");
  const today = new Date();

  const monthlyTransactions = transactions.filter((transaction) =>
    matchesMonthAndYear(transaction?.createdAt, month, year)
  );

  const monthlyRevenue = monthlyTransactions.reduce(
    (total, transaction) => total + Number(transaction?.totalPrice || 0),
    0
  );

  return {
    totalUsers: users.length,
    activeUsers: users.filter(resolveUserActive).length,
    loginsToday: loginActivities.filter((activity) => {
      const createdAt = new Date(activity?.createdAt);
      return !Number.isNaN(createdAt.getTime()) && isSameCalendarDay(createdAt, today);
    }).length,
    monthlyTransactions: monthlyTransactions.length,
    monthlyRevenue,
  };
}

export function buildRecentLogins(activityLogs, limit = 5) {
  return activityLogs
    .filter((activity) => activity?.action === "LOGIN")
    .sort(
      (left, right) =>
        new Date(right?.createdAt || 0).getTime() -
        new Date(left?.createdAt || 0).getTime()
    )
    .slice(0, limit);
}
