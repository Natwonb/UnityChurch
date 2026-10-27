import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { clearIdentity, getIdentity, saveIdentity } from "@/lib/identity";

const ChurchContext = createContext(null);

export function ChurchProvider({ children }) {
  const [identity, setIdentityState] = useState(() => getIdentity());
  const [church, setChurch] = useState(null);
  const [membership, setMembership] = useState(null);
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const current = getIdentity();
    setIdentityState(current);
    if (!current || !current.church_id) {
      setChurch(null);
      setMembership(null);
      setMembers([]);
      setDepartments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [churchPage, myMembers, departmentPage, allMembers] = await Promise.all([
      base44.entities.Church.filter({ id: current.church_id }, { limit: 1 }),
      base44.entities.Membership.filter(
        { church_id: current.church_id, member_key: current.member_key },
        { limit: 1 },
      ),
      base44.entities.Department.filter({ church_id: current.church_id }, { sort: "sort_order", limit: 50 }),
      base44.entities.Membership.filter({ church_id: current.church_id }, { limit: 300 }),
    ]);
    const foundChurch = churchPage.items?.[0] || null;
    const myMembership = myMembers.items?.[0] || null;
    // The legacy admin pointer belongs on the server; the client never keeps it.
    const { admin_member_key, ...safeChurch } = foundChurch || {};
    setChurch(foundChurch ? safeChurch : null);
    setMembership(myMembership);
    setDepartments(departmentPage.items || []);
    setMembers(allMembers.items || []);
    if (foundChurch && myMembership) {
      saveIdentity({
        ...current,
        name: myMembership.name,
        email: myMembership.email,
        church_name: foundChurch.name,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const leaveChurch = useCallback(() => {
    clearIdentity();
    setIdentityState(null);
    setChurch(null);
    setMembership(null);
    setMembers([]);
    setDepartments([]);
  }, []);

  const memberName = useCallback(
    (key) => members.find((m) => m.member_key === key)?.name || "",
    [members],
  );

  const departmentName = useCallback(
    (id) => departments.find((d) => d.id === id)?.name || "",
    [departments],
  );

  const isLeaderOf = useCallback(
    (departmentId) => {
      if (!membership) return false;
      if (membership.role === "admin") return true;
      return membership.role === "leader" && (membership.department_ids || []).includes(departmentId);
    },
    [membership],
  );

  const value = {
    identity,
    church,
    membership,
    members,
    departments,
    loading,
    role: membership?.role || "member",
    isAdmin: membership?.role === "admin",
    canPublish: membership?.role === "admin" || membership?.role === "leader",
    myDepartments: membership?.department_ids || [],
    isLeaderOf,
    memberName,
    departmentName,
    reload: load,
    leaveChurch,
  };

  return <ChurchContext.Provider value={value}>{children}</ChurchContext.Provider>;
}

export function useChurch() {
  const ctx = useContext(ChurchContext);
  if (!ctx) throw new Error("useChurch must be used inside a ChurchProvider");
  return ctx;
}